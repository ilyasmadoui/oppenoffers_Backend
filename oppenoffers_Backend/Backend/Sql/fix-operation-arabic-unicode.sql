-- Fix Arabic / Unicode for Service_Contractant and Objet
-- Run on database: PlisFlow
-- Node.js already uses sql.NVarChar for these parameters; this aligns SQL Server.

USE [PlisFlow];
GO

-- 1) Table columns must be NVARCHAR (VARCHAR cannot store Arabic)
IF EXISTS (
    SELECT 1 FROM sys.columns c
    JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'OPERATIONS' AND c.name = 'Service_Contractant'
      AND TYPE_NAME(c.user_type_id) = 'varchar'
)
BEGIN
    ALTER TABLE dbo.OPERATIONS
        ALTER COLUMN Service_Contractant NVARCHAR(200) NULL;
END
GO

IF EXISTS (
    SELECT 1 FROM sys.columns c
    JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'OPERATIONS' AND c.name = 'Objet'
      AND TYPE_NAME(c.user_type_id) = 'varchar'
)
BEGIN
    ALTER TABLE dbo.OPERATIONS
        ALTER COLUMN Objet NVARCHAR(MAX) NULL;
END
GO

-- 2) insertNewOperation — Unicode parameters (same pattern as @aProgram)
ALTER PROCEDURE [dbo].[insertNewOperation]
    @aNumero VARCHAR(50),
    @aService_contractant NVARCHAR(200),
    @aTypeBudget TINYINT,
    @aModeAttribuation TINYINT,
    @aObjet NVARCHAR(MAX),
    @aTypeTravaux TINYINT,
    @aNumeroVisa VARCHAR(50),
    @aDateVisa DATE,
    @adminID UNIQUEIDENTIFIER,
    @aProgram NVARCHAR(255),
    @aAP DECIMAL(18, 2)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @aId_Operation UNIQUEIDENTIFIER = NEWID();

    BEGIN TRY
        IF EXISTS (SELECT 1 FROM OPERATIONS WHERE Numero = @aNumero AND State = 2)
        BEGIN
            RETURN 1001;
        END

        INSERT INTO OPERATIONS
            (Id, Numero, Service_Contractant, TypeBudget, ModeAttribuation,
             Objet, TypeTravaux, State, NumeroVisa, DateVisa, adminId,
             Program, AP)
        VALUES
            (@aId_Operation, @aNumero, @aService_contractant, @aTypeBudget,
             @aModeAttribuation, @aObjet, @aTypeTravaux, 2, @aNumeroVisa, @aDateVisa, @adminID,
             @aProgram, @aAP);

        RETURN 0;
    END TRY
    BEGIN CATCH
        RETURN 5000;
    END CATCH
END
GO

-- 3) updateExistingOperation — matches backend (dbo.updateExistingOperation)
ALTER PROCEDURE [dbo].[updateExistingOperation]
    @aId_Operation UNIQUEIDENTIFIER,
    @aNumero VARCHAR(50),
    @aService_contractant NVARCHAR(200),
    @aTypeBudget TINYINT,
    @aModeAttribuation TINYINT,
    @aObjet NVARCHAR(MAX),
    @aTypeTravaux TINYINT,
    @aNumeroVisa VARCHAR(50),
    @aDateVisa DATE,
    @aProgram NVARCHAR(255) = NULL,
    @aAP DECIMAL(18, 2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM OPERATIONS WHERE Id = @aId_Operation)
    BEGIN
        UPDATE OPERATIONS
        SET
            Numero = @aNumero,
            Service_Contractant = @aService_contractant,
            TypeBudget = @aTypeBudget,
            ModeAttribuation = @aModeAttribuation,
            Objet = @aObjet,
            TypeTravaux = @aTypeTravaux,
            NumeroVisa = @aNumeroVisa,
            DateVisa = @aDateVisa,
            Program = @aProgram,
            AP = @aAP
        WHERE Id = @aId_Operation;

        RETURN 0;
    END

    RETURN 1004;
END
GO
