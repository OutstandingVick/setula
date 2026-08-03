import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Database } from "./domain.js";
import { emptyDatabase } from "./domain.js";

export interface Store {
  load(): Promise<Database>;
  save(database: Database): Promise<void>;
}

export class MemoryStore implements Store {
  private database: Database;

  constructor(initial: Database = emptyDatabase()) {
    this.database = structuredClone(initial);
  }

  async load(): Promise<Database> {
    return structuredClone(this.database);
  }

  async save(database: Database): Promise<void> {
    this.database = structuredClone(database);
  }
}

export class JsonFileStore implements Store {
  constructor(private readonly path: string) {}

  async load(): Promise<Database> {
    try {
      return JSON.parse(await readFile(this.path, "utf8")) as Database;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyDatabase();
      throw error;
    }
  }

  async save(database: Database): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const temporaryPath = `${this.path}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, {
      mode: 0o600,
    });
    await rename(temporaryPath, this.path);
  }
}
