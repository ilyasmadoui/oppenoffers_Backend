USE [PlisFlow];
GO

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
