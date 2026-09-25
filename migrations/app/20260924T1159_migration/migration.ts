#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract';
import endContract from '../../snapshots/2482e068fb11f084425bdfea93f121bbdf536eae5caabe2e7717eaacd0bd7957/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d4df320dd313d857edd84d804bf524a1e573e442d7daf4396d3f3a1135233456/contract';
import startContract from '../../snapshots/d4df320dd313d857edd84d804bf524a1e573e442d7daf4396d3f3a1135233456/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

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
      this.addColumn({
        schema: 'public',
        table: 'payment',
        column: col('status', 'text', {
          notNull: true,
          default: lit('PENDING'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'payment',
        constraint: 'payment_status_check_0760bcc2',
        expression: "\"status\" IN ('PENDING', 'VERIFIED', 'REJECTED')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
