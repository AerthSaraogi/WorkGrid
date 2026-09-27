CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE TABLE "Users" (
        "Id" INTEGER NOT NULL,
        "Name" TEXT NOT NULL,
        "Email" TEXT NOT NULL,
        "PasswordHash" TEXT NOT NULL,
        "Role" TEXT NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE TABLE "Projects" (
        "Id" INTEGER NOT NULL,
        "Name" TEXT NOT NULL,
        "Description" TEXT NOT NULL,
        "CreatedBy" INTEGER NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        CONSTRAINT "PK_Projects" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Projects_Users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE TABLE "Tasks" (
        "Id" INTEGER NOT NULL,
        "ProjectId" INTEGER NOT NULL,
        "Title" TEXT NOT NULL,
        "Description" TEXT NOT NULL,
        "Type" TEXT NOT NULL,
        "Status" TEXT NOT NULL,
        "Priority" TEXT NOT NULL,
        "AssignedTo" INTEGER,
        "CreatedBy" INTEGER NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        "UpdatedAt" TEXT NOT NULL,
        "DueDate" TEXT,
        CONSTRAINT "PK_Tasks" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Tasks_Projects_ProjectId" FOREIGN KEY ("ProjectId") REFERENCES "Projects" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Tasks_Users_AssignedTo" FOREIGN KEY ("AssignedTo") REFERENCES "Users" ("Id") ON DELETE SET NULL,
        CONSTRAINT "FK_Tasks_Users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE TABLE "Comments" (
        "Id" INTEGER NOT NULL,
        "TaskId" INTEGER NOT NULL,
        "UserId" INTEGER NOT NULL,
        "Content" TEXT NOT NULL,
        "CreatedAt" TEXT NOT NULL,
        CONSTRAINT "PK_Comments" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Comments_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_Comments_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE TABLE "TaskHistories" (
        "Id" INTEGER NOT NULL,
        "TaskId" INTEGER NOT NULL,
        "UserId" INTEGER NOT NULL,
        "Action" TEXT NOT NULL,
        "OldValue" TEXT,
        "NewValue" TEXT,
        "CreatedAt" TEXT NOT NULL,
        CONSTRAINT "PK_TaskHistories" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TaskHistories_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_TaskHistories_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Comments_TaskId" ON "Comments" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Comments_UserId" ON "Comments" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Projects_CreatedBy" ON "Projects" ("CreatedBy");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_TaskHistories_CreatedAt" ON "TaskHistories" ("CreatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_TaskHistories_TaskId" ON "TaskHistories" ("TaskId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_TaskHistories_UserId" ON "TaskHistories" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_AssignedTo" ON "Tasks" ("AssignedTo");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_CreatedAt" ON "Tasks" ("CreatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_CreatedBy" ON "Tasks" ("CreatedBy");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_Priority" ON "Tasks" ("Priority");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_ProjectId" ON "Tasks" ("ProjectId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE INDEX "IX_Tasks_Status" ON "Tasks" ("Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260925181244_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260925181244_InitialCreate', '8.0.8');
    END IF;
END $EF$;
COMMIT;

