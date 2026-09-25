#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1ab92cfb575a3ad510612c93c5566f46c8b00b0098ff1eb43145fccc5b3290da/contract';
import endContract from '../../snapshots/1ab92cfb575a3ad510612c93c5566f46c8b00b0098ff1eb43145fccc5b3290da/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract';
import startContract from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'review',
        columns: [
          col('comment', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fieldId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('rating', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'review',
        index: 'review_fieldId_idx_44d815d7',
        columns: ['fieldId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'review',
        index: 'review_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'review',
        foreignKey: {
          name: 'review_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'review',
        foreignKey: {
          name: 'review_fieldId_fkey',
          columns: ['fieldId'],
          references: { schema: 'public', table: 'field', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
