import {MigrationInterface, QueryRunner} from "typeorm";

export class newTables1673963126681 implements MigrationInterface {
    name = 'newTables1673963126681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_606923b0b068ef262dfdcd18f44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "boards_shared_with_users" ("boardsId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_bb221da643a5bfaf468e9a2d7b3" PRIMARY KEY ("boardsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_999ad43102001cefc4908a3b97" ON "boards_shared_with_users" ("boardsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8335107f1121e8f6f0413b97c8" ON "boards_shared_with_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "columns" ADD CONSTRAINT "FK_ac92bfd7ba33174aabef610f361" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_8a75fdea98c72c539a0879cb0d1" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_1ce74d5411749b559748b9f3276" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "boards_shared_with_users" ADD CONSTRAINT "FK_999ad43102001cefc4908a3b97f" FOREIGN KEY ("boardsId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "boards_shared_with_users" ADD CONSTRAINT "FK_8335107f1121e8f6f0413b97c83" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards_shared_with_users" DROP CONSTRAINT "FK_8335107f1121e8f6f0413b97c83"`);
        await queryRunner.query(`ALTER TABLE "boards_shared_with_users" DROP CONSTRAINT "FK_999ad43102001cefc4908a3b97f"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_1ce74d5411749b559748b9f3276"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_8a75fdea98c72c539a0879cb0d1"`);
        await queryRunner.query(`ALTER TABLE "columns" DROP CONSTRAINT "FK_ac92bfd7ba33174aabef610f361"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8335107f1121e8f6f0413b97c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_999ad43102001cefc4908a3b97"`);
        await queryRunner.query(`DROP TABLE "boards_shared_with_users"`);
        await queryRunner.query(`DROP TABLE "boards"`);
    }

}
