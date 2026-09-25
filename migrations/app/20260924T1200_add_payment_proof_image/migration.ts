#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract';
import endContract from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7c87ea6aeae5bd1f275cecbe67fbee849226662aa834645384ab7dace47f6136/contract';
import startContract from '../../snapshots/7c87ea6aeae5bd1f275cecbe67fbee849226662aa834645384ab7dace47f6136/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'payment',
        column: col('proofImage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
