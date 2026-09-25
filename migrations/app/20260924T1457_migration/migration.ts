#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2d0aba03fad888c98f509b6e9ba3a6412fecea2db9655ff93ba54782f24d0bcf/contract';
import endContract from '../../snapshots/2d0aba03fad888c98f509b6e9ba3a6412fecea2db9655ff93ba54782f24d0bcf/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d4df320dd313d857edd84d804bf524a1e573e442d7daf4396d3f3a1135233456/contract';
import startContract from '../../snapshots/d4df320dd313d857edd84d804bf524a1e573e442d7daf4396d3f3a1135233456/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

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
      this.createTable({
        schema: 'public',
        table: 'tournament',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('endDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'tournamentParticipant',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('joinedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('tournamentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
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
      this.addUnique({
        schema: 'public',
        table: 'tournamentParticipant',
        constraint: 'tournamentParticipant_tournamentId_userId_key',
        columns: ['tournamentId', 'userId'],
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
      this.createIndex({
        schema: 'public',
        table: 'tournament',
        index: 'tournament_organizerId_idx_17a44ca9',
        columns: ['organizerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tournamentParticipant',
        index: 'tournamentParticipant_tournamentId_idx_d0bd97a6',
        columns: ['tournamentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tournamentParticipant',
        index: 'tournamentParticipant_userId_idx_a489d58a',
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
      this.addForeignKey({
        schema: 'public',
        table: 'tournament',
        foreignKey: {
          name: 'tournament_organizerId_fkey',
          columns: ['organizerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tournamentParticipant',
        foreignKey: {
          name: 'tournamentParticipant_tournamentId_fkey',
          columns: ['tournamentId'],
          references: { schema: 'public', table: 'tournament', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tournamentParticipant',
        foreignKey: {
          name: 'tournamentParticipant_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
