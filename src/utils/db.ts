import { D1Orm, DataTypes, Model } from 'd1-orm';
import type { MiddlewareHandler } from 'hono';
import { StatusError } from './error';
import { nanoid } from './nanoid';

export enum DbTableName {
  MATERIAL = 'material',
}

export const createDbMiddleware: (tableName: DbTableName) => MiddlewareHandler<{
  Bindings: Env;
  Variables: { db: Db };
}> = (tableName: DbTableName) => async (c, next) => {
  c.set('db', new Db(c.env.DB, tableName));
  await next();
};

export class Db {
  private readonly orm: D1Orm;
  private readonly model: ReturnType<typeof this.createModel>;

  constructor(
    db: D1Database,
    private readonly tableName: DbTableName,
  ) {
    this.orm = new D1Orm(db);
    this.model = this.createModel(tableName);
  }

  async create(obj: any) {
    const id = nanoid();
    await this.model.InsertOne({
      id,
      content: JSON.stringify(obj),
      lastUpdate: Date.now(),
    });
    return id;
  }

  async get(id: string) {
    const row = await this.model.First({ where: { id } });
    if (row?.content) return JSON.parse(row.content);
    throw new StatusError(404);
  }

  async update(id: string, obj: any) {
    const result = await this.model.Update({
      where: { id },
      data: {
        id,
        content: JSON.stringify(obj),
        lastUpdate: Date.now(),
      },
    });
    if (result.meta.changes === 0) throw new StatusError(404);
  }

  async purge() {
    const query = `DELETE FROM \`${this.tableName}\` WHERE lastUpdate < ?`;
    const result = await this.orm
      .prepare(query)
      .bind(Date.now() - 90 * 86400 * 1000)
      .run();
    console.log('purge', this.tableName, result.meta.changes);
  }

  private createModel(tableName: string) {
    return new Model(
      {
        D1Orm: this.orm,
        tableName,
        primaryKeys: 'id',
      },
      {
        id: {
          type: DataTypes.CHAR,
          notNull: true,
        },
        content: {
          type: DataTypes.TEXT,
          notNull: true,
        },
        lastUpdate: {
          type: DataTypes.INT,
          notNull: true,
        },
      },
    );
  }
}
