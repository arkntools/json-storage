import { D1Orm, DataTypes, Model } from 'd1-orm';
import { nanoid } from './nanoid';

export class Db {
  public readonly orm: D1Orm;
  public readonly material: ReturnType<typeof this.createModel>;

  public constructor(db: D1Database) {
    this.orm = new D1Orm(db);
    this.material = this.createModel('material');
  }

  public async create(obj: any) {
    const id = nanoid();
    await this.material.InsertOne({
      id,
      content: JSON.stringify(obj),
      lastUpdate: Date.now(),
    });
    return id;
  }

  public async get(id: string) {
    const row = await this.material.First({ where: { id } });
    return row?.content ? JSON.parse(row.content) : undefined;
  }

  public async update(id: string, obj: any) {
    const result = await this.material.Update({
      where: { id },
      data: {
        id,
        content: JSON.stringify(obj),
        lastUpdate: Date.now(),
      },
    });
    if (result.meta.changes === 0) throw new Error('id not exists');
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
