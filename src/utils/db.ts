import { D1Orm, DataTypes, Model } from 'd1-orm';
import { nanoid } from './nanoid';
import { StatusError } from './error';

export class Db {
  private readonly orm: D1Orm;
  private readonly model: ReturnType<typeof this.createModel>;

  public constructor(
    db: D1Database,
    private readonly tableName: string,
  ) {
    this.orm = new D1Orm(db);
    this.model = this.createModel(tableName);
  }

  public async create(obj: any) {
    const id = nanoid();
    await this.model.InsertOne({
      id,
      content: JSON.stringify(obj),
      lastUpdate: Date.now(),
    });
    return id;
  }

  public async get(id: string) {
    const row = await this.model.First({ where: { id } });
    if (row?.content) return JSON.parse(row.content);
    throw new StatusError(404);
  }

  public async update(id: string, obj: any) {
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
