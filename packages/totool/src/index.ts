import { z } from "zod";
import {
  tool as langchainTool,
  DynamicStructuredTool,
} from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/dist/runnables/types";
import { CoreMessage, tool as aiTool, Tool } from "ai";
import debug from "debug";
import { zodToJsonSchema } from "zod-to-json-schema";

const log = debug("totool");

export type RuntimeConfig =
  | RunnableConfig
  | {
      abortSignal?: AbortSignal;
      toolCallId: string;
      messages: CoreMessage[];
    };

export abstract class ToTool<A, R> {
  readonly name: string;
  readonly description: string;
  readonly parameters: z.ZodObject<any>;
  readonly service: string;
  readonly auth: A;
  readonly predefinedParameters?: Record<string, any>;

  /**
   * This constructor is meant to be overriden by specific tools.
   * The name, description, parameters, and service are pre-determined by the tool developer.
   * The auth and predefinedParameters are injected at runtime with the constructor.
   * The child constructor would have a signature { auth, predefinedParameters }
   * @param config
   */
  constructor({
    name,
    description,
    parameters,
    service,
    auth,
    predefinedParameters,
  }: {
    name: string;
    description: string;
    parameters: z.ZodObject<any>;
    service: string;
    auth: A;
    predefinedParameters?: Record<string, any>;
  }) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.service = service;
    this.auth = auth;
    if (predefinedParameters) {
      this.parameters.partial().parse(predefinedParameters);
      this.predefinedParameters = predefinedParameters;
      this.parameters = this.parameters.omit(
        Object.keys(predefinedParameters).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, true>)
      );
    }
    log(`${this.name} parameters:`, zodToJsonSchema(this.parameters));
    log(`${this.name} predefinedParameters:`, this.predefinedParameters);
  }

  abstract execute(input: any, config: RuntimeConfig): Promise<R>;

  /**
   * Returns the predefined parameters for the tool.
   * These parameters can be used to limit the model's decision space and simplify tool usage.
   * @returns
   */
  getPredefinedParameters() {
    return this.predefinedParameters;
  }

  /**
   * Returns a Langchain tool
   * @returns
   */
  async langchainTool(): Promise<DynamicStructuredTool> {
    return langchainTool(
      async (input, config) => {
        log("input", input);
        log("config", config);
        log("this.predefinedParameters", this.predefinedParameters);
        try {
          const result = await this.execute(
            { ...this.predefinedParameters, ...input },
            config
          );
          log("result", result);
          return result;
        } catch (error) {
          console.error(`Error executing ${this.name} tool:`, {
            error,
            input,
            predefinedParameters: this.predefinedParameters,
          });
          throw error;
        }
      },
      {
        name: this.name,
        description: this.description,
        schema: this.parameters,
      }
    );
  }

  /**
   * Returns an AI SDK tool
   * @returns
   */
  async aiSdkTool(): Promise<Tool> {
    return aiTool({
      execute: async (input, config) => {
        try {
          return await this.execute(
            { ...this.predefinedParameters, ...input },
            config
          );
        } catch (error) {
          console.error(`Error executing ${this.name} tool:`, {
            error,
            input,
            predefinedParameters: this.predefinedParameters,
          });
          throw error;
        }
      },
      description: this.description,
      parameters: this.parameters,
    });
  }

  /**
   * Returns the auth object for the tool
   * @returns
   */
  getAuth() {
    return this.auth;
  }

  /**
   * Returns the tool name
   * @returns
   */
  getToolName() {
    return this.name;
  }

  /**
   * Returns the tool description
   * @returns
   */
  getToolDescription() {
    return this.description;
  }
}
