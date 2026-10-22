import { tool } from "@langchain/core/tools";
import { z } from "zod";

const generateName = tool(
  async ({ race }) => {
    const names = {
      elf: ["Aelindra", "Thalion", "Elarion"],
      dwarf: ["Borin", "Thorgar", "Durin"],
      human: ["Aldric", "Serena", "Cedric"],
    };

    const options = names[race];
    return options[Math.floor(Math.random() * options.length)];
  },
  {
    name: "generate_name",
    description: "Genererar ett slumpmässigt fantasynamn.",
    schema: z.object({
      race: z.enum(["elf", "dwarf", "human"]),
    }),
  }
);

export const tools = [generateName];