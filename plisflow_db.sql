-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 01 fév. 2026 à 21:51
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `plisflow_db`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteAnnonceSQL` (IN `p_Id` CHAR(36), OUT `p_resultCode` INT)   BEGIN
    DECLARE v_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_exists
    FROM annonces
    WHERE Id = p_Id;

    IF v_exists = 0 THEN
        SET p_resultCode = 1003; 
    ELSE
        
        UPDATE annonces
        SET Status = 0
        WHERE Id = p_Id;

        IF ROW_COUNT() > 0 THEN
            SET p_resultCode = 0; 
        ELSE
            SET p_resultCode = 2001; 
        END IF;

    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteLotSQL` (IN `p_Id` CHAR(36), OUT `p_resultCode` INT)   BEGIN
    DECLARE v_count INT DEFAULT 0;


    SELECT COUNT(*) INTO v_count
    FROM lots
    WHERE id = p_Id;

    IF v_count = 0 THEN
        SET p_resultCode = 3001; 
    ELSE
       
        DELETE FROM lots
        WHERE id = p_Id;

        SET p_resultCode = 0; 
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteOperationsSQL` (IN `p_Num_Operation` VARCHAR(50), OUT `p_resultCode` INT)   BEGIN
    DECLARE v_operationId CHAR(36);
    DECLARE v_notFound INT DEFAULT 0;

    -- Gestionnaire si SELECT INTO ne retourne rien
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_notFound = 1;

    -- Gestionnaire d'erreur SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_resultCode = 5000;
    END;

    -- Récupérer l'ID de l'opération
    SELECT Id INTO v_operationId
    FROM OPERATIONS
    WHERE Numero = p_Num_Operation
    LIMIT 1;

    -- Vérifier si l'opération existe
    IF v_notFound = 1 THEN
        SET p_resultCode = 1005; -- opération non trouvée
    ELSE
        -- Démarrer la transaction
        START TRANSACTION;

        -- Mettre à jour les annonces liées à l'opération
        UPDATE ANNONCES
        SET Status = 0
        WHERE Id_Operation = v_operationId;

        -- Supprimer les lots liés
        DELETE FROM Lots
        WHERE Id_Operation = v_operationId;

        -- Mettre à jour l'état de l'opération
        UPDATE OPERATIONS
        SET State = 0
        WHERE Id = v_operationId;

        -- Valider la transaction
        COMMIT;
        SET p_resultCode = 0; -- succès
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteRetraitBySupplierAndOperation` (IN `p_SupplierID` INT, IN `p_OperationID` INT, OUT `p_ResultCode` INT)   BEGIN
    DECLARE existingCount INT DEFAULT 0;

    SELECT COUNT(*) 
    INTO existingCount
    FROM retrait_cahier_charges
    WHERE SupplierID = p_SupplierID
      AND OperationID = p_OperationID
      AND Status = 1;

    IF existingCount = 0 THEN
        SET p_ResultCode = 1002; 
    ELSE
        
        UPDATE retrait_cahier_charges
        SET Status = 0
        WHERE SupplierID = p_SupplierID
          AND OperationID = p_OperationID
          AND Status = 1;

        SET p_ResultCode = 0; 
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteSupplier` (IN `pId` CHAR(36))   BEGIN
    UPDATE suppliers
    SET Status = 0
    WHERE Id = pId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertFournisseurPotential` (IN `aNomPrenom` VARCHAR(100), IN `aAdresse` VARCHAR(50), IN `aTelephone` VARCHAR(50), IN `aEmail` VARCHAR(50), IN `adminID` CHAR(36))   BEGIN
    DECLARE aId CHAR(36);

    SET aId = UUID();

    -- Vérification téléphone
    IF EXISTS (
        SELECT 1 FROM suppliers
        WHERE Telephone = aTelephone
          AND Telephone IS NOT NULL
          AND Telephone <> ''
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MYSQL_ERRNO = 51004,
            MESSAGE_TEXT = 'ERR_PHONE';
    END IF;

    -- Vérification email
    IF EXISTS (
        SELECT 1 FROM suppliers
        WHERE Email = aEmail
          AND Email IS NOT NULL
          AND Email <> ''
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MYSQL_ERRNO = 51005,
            MESSAGE_TEXT = 'ERR_EMAIL';
    END IF;

    INSERT INTO suppliers(
        Id, NomPrenom, Adresse, Telephone, Email, Status, adminId
    )
    VALUES (
        aId, aNomPrenom, aAdresse, aTelephone, aEmail, 1, adminID
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertNewAnnonceSQL` (OUT `p_resultCode` INT, IN `p_Id_Operation` CHAR(36), IN `p_Numero` VARCHAR(10), IN `p_Date_Publication` DATE, IN `p_Journal` VARCHAR(100), IN `p_Delai` INT, IN `p_Date_Overture` DATE, IN `p_Heure_Ouverture` TIME, IN `p_Status` TINYINT, IN `p_AdminID` CHAR(36))   proc: BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_op_exist INT DEFAULT 0;
    DECLARE v_admin_exist INT DEFAULT 0;

   
    SELECT COUNT(*)
    INTO v_op_exist
    FROM operations
    WHERE Id = p_Id_Operation;

    IF v_op_exist = 0 THEN
        SET p_resultCode = 1002; 
        LEAVE proc;
    END IF;

    IF p_AdminID IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_admin_exist
        FROM admins
        WHERE Id = p_AdminID;

        IF v_admin_exist = 0 THEN
            SET p_resultCode = 1003;
            LEAVE proc;
        END IF;
    END IF;


    SELECT COUNT(*)
    INTO v_count
    FROM annonces
    WHERE Id_Operation = p_Id_Operation
      AND Numero = p_Numero;

    IF v_count > 0 THEN
        SET p_resultCode = 1001; 
    ELSE
        INSERT INTO annonces (
            Id,
            Id_Operation,
            Numero,
            Date_Publication,
            Journal,
            Delai,
            Date_Overture,
            Heure_Ouverture,
            Status,
            adminId
        )
        VALUES (
            UUID(),
            p_Id_Operation,
            p_Numero,
            p_Date_Publication,
            p_Journal,
            p_Delai,
            p_Date_Overture,
            p_Heure_Ouverture,
            IFNULL(p_Status, 1),
            p_AdminID
        );

        SET p_resultCode = 0;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertNewLotSQL` (IN `p_NumeroLot` VARCHAR(50), IN `p_Id_Operation` CHAR(36), IN `p_Designation` VARCHAR(200), IN `p_AdminID` CHAR(36), OUT `p_resultCode` INT)   BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_op_exist INT DEFAULT 0;
    DECLARE v_admin_exist INT DEFAULT 0;

    SELECT COUNT(*) INTO v_op_exist
    FROM operations
    WHERE Id = p_Id_Operation;

    IF v_op_exist = 0 THEN
        SET p_resultCode = 1002;
    ELSE
      
        SELECT COUNT(*) INTO v_admin_exist
        FROM admins
        WHERE Id = p_AdminID;

        IF v_admin_exist = 0 THEN
            SET p_resultCode = 1003;
        ELSE
            
            SELECT COUNT(*) INTO v_exists
            FROM lots
            WHERE NumeroLot = p_NumeroLot
              AND id_Operation = p_Id_Operation;

            IF v_exists > 0 THEN
                SET p_resultCode = 1001; 
            ELSE
                INSERT INTO lots (
                    NumeroLot,
                    id_Operation,
                    Designation,
                    adminId
                )
                VALUES (
                    p_NumeroLot,
                    p_Id_Operation,
                    p_Designation,
                    p_AdminID
                );

                SET p_resultCode = 0; 
            END IF;
        END IF;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertNewOperationSQL` (IN `p_NumOperation` VARCHAR(50), IN `p_ServContract` VARCHAR(200), IN `p_TypeBudget` TINYINT, IN `p_ModeAttribuation` TINYINT, IN `p_Objectif` VARCHAR(500), IN `p_TypeTravaux` TINYINT, IN `p_VisaNum` VARCHAR(50), IN `p_DateVisa` DATE, IN `p_AdminID` CHAR(36), OUT `p_resultCode` INT)   main_block: BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_admin_exist INT DEFAULT 0;

    -- Vérifier si NumOperation existe déjà
    SELECT COUNT(*) INTO v_count
    FROM operations
    WHERE Numero = p_NumOperation;

    IF v_count > 0 THEN
        SET p_resultCode = 1001; -- NumOperation déjà existant
        LEAVE main_block;
    END IF;

    -- Vérifier si admin existe
    SELECT COUNT(*) INTO v_admin_exist
    FROM admins
    WHERE Id = p_AdminID;

    IF v_admin_exist = 0 THEN
        SET p_resultCode = 1002; -- admin inexistant
        LEAVE main_block;
    END IF;

    -- Insérer la nouvelle opération
    INSERT INTO operations (
        Id,
        Numero,
        Service_Contractant,
        TypeBudget,
        ModeAttribuation,
        Objet,
        TypeTravaux,
        State,
        NumeroVisa,
        DateVisa,
        adminId
    )
    VALUES (
        UUID(),                -- Id généré automatiquement
        p_NumOperation,
        p_ServContract,
        p_TypeBudget,
        p_ModeAttribuation,
        p_Objectif,
        p_TypeTravaux,
        1,                     -- State = actif
        p_VisaNum,
        p_DateVisa,
        p_AdminID
    );

    SET p_resultCode = 0; -- Succès

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertRetrait` (IN `p_SupplierID` CHAR(36), IN `p_OperationID` CHAR(36), IN `p_NumeroRetrait` VARCHAR(50), IN `p_AdminID` CHAR(36), OUT `p_ResultCode` INT)   BEGIN
    DECLARE existingCount INT;

    -- Vérifier la duplication du NumeroRetrait pour la même opération
    SELECT COUNT(*) INTO existingCount
    FROM retrait_cahier_charges
    WHERE OperationID = p_OperationID
      AND NumeroRetrait = p_NumeroRetrait;

    IF existingCount > 0 THEN
        SET p_ResultCode = 1001; -- Duplication
    ELSE
        -- Insérer le retrait avec Status = 1 par défaut
        INSERT INTO retrait_cahier_charges
        (id, SupplierID, OperationID, DateRetrait, NumeroRetrait, Status, adminId)
        VALUES (UUID(), p_SupplierID, p_OperationID, CURDATE(), p_NumeroRetrait, 1, p_AdminID);

        SET p_ResultCode = 0; -- Succès
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `insertSupplier` (IN `aNomPrenom` VARCHAR(100), IN `aNomSociete` VARCHAR(50), IN `aNatureJuridique` VARCHAR(50), IN `aAdresse` VARCHAR(50), IN `aTelephone` VARCHAR(50), IN `aRc` VARCHAR(50), IN `aNif` VARCHAR(50), IN `aRib` VARCHAR(50), IN `aEmail` VARCHAR(50), IN `aAi` VARCHAR(50), IN `aAgenceBancaire` VARCHAR(50), IN `adminID` CHAR(36), OUT `p_ResultCode` INT)   main_block: BEGIN
    DECLARE aId CHAR(36);

    DECLARE rc_count INT DEFAULT 0;
    DECLARE nif_count INT DEFAULT 0;
    DECLARE tel_count INT DEFAULT 0;
    DECLARE ai_count INT DEFAULT 0;
    DECLARE rib_count INT DEFAULT 0;
    DECLARE email_count INT DEFAULT 0;

    -- Error handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_ResultCode = 5000;
        ROLLBACK;
    END;

    START TRANSACTION;

    SET aId = UUID();

    -- Check RC
    SELECT COUNT(*) INTO rc_count
    FROM suppliers
    WHERE Rc = aRc AND Rc IS NOT NULL AND Rc <> '';

    -- Check NIF
    SELECT COUNT(*) INTO nif_count
    FROM suppliers
    WHERE Nif = aNif AND Nif IS NOT NULL AND Nif <> '';

    -- Check Telephone
    SELECT COUNT(*) INTO tel_count
    FROM suppliers
    WHERE Telephone = aTelephone AND Telephone IS NOT NULL AND Telephone <> '';

    -- Check AI
    SELECT COUNT(*) INTO ai_count
    FROM suppliers
    WHERE Ai = aAi AND Ai IS NOT NULL AND Ai <> '';

    -- Check RIB
    SELECT COUNT(*) INTO rib_count
    FROM suppliers
    WHERE Rib = aRib AND Rib IS NOT NULL AND Rib <> '';

    -- Check Email
    SELECT COUNT(*) INTO email_count
    FROM suppliers
    WHERE Email = aEmail AND Email IS NOT NULL AND Email <> '';

    IF rc_count > 0 THEN
        SET p_ResultCode = 1002;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    IF nif_count > 0 THEN
        SET p_ResultCode = 1003;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    IF tel_count > 0 THEN
        SET p_ResultCode = 1004;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    IF ai_count > 0 THEN
        SET p_ResultCode = 1005;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    IF rib_count > 0 THEN
        SET p_ResultCode = 1006;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    IF email_count > 0 THEN
        SET p_ResultCode = 1007;
        ROLLBACK;
        LEAVE main_block;
    END IF;

    INSERT INTO suppliers (
        Id,
        NomPrenom,
        NomSociete,
        NatureJuridique,
        Adresse,
        Telephone,
        Rc,
        Nif,
        Rib,
        Email,
        Ai,
        AgenceBancaire,
        Status,
        adminId
    ) VALUES (
        aId,
        aNomPrenom,
        aNomSociete,
        aNatureJuridique,
        aAdresse,
        aTelephone,
        aRc,
        aNif,
        aRib,
        aEmail,
        aAi,
        aAgenceBancaire,
        1,
        adminID
    );

    COMMIT;
    SET p_ResultCode = 0;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `loginUserSQL` (IN `p_email` VARCHAR(255), IN `p_password` VARCHAR(255))   BEGIN
    -- Le mot de passe est déjà hashé dans Node.js
    SELECT 
        id AS userId
    FROM admins
    WHERE email = p_email
      AND password = p_password;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `manageActivateOperation` (IN `p_id` CHAR(36))   BEGIN
    UPDATE OPERATIONS
    SET State = 1
    WHERE Id = p_id
      AND State = 0;

    SELECT 1001 AS Result; -- Operation Activated
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ResetAdminPassword` (IN `p_id` VARCHAR(255), IN `p_hashedPassword` VARCHAR(255))   BEGIN
    UPDATE admins
    SET password = p_hashedPassword
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateAnnonceSQL` (IN `p_Numero` VARCHAR(10), IN `p_Date_Publication` DATE, IN `p_Journal` VARCHAR(100), IN `p_Delai` INT, IN `p_Date_Overture` DATE, IN `p_Heure_Ouverture` TIME, OUT `p_resultCode` INT)   BEGIN
    DECLARE v_exists INT DEFAULT 0;


    SELECT COUNT(*) INTO v_exists
    FROM annonces
    WHERE Numero = p_Numero
      AND Status = 1;

    IF v_exists = 0 THEN

        SET p_resultCode = 1003; 
    ELSE

        UPDATE annonces
        SET Date_Publication = p_Date_Publication,
            Journal = p_Journal,
            Delai = p_Delai,
            Date_Overture = p_Date_Overture,
            Heure_Ouverture = p_Heure_Ouverture
        WHERE Numero = p_Numero
          AND Status = 1;


        IF ROW_COUNT() > 0 THEN
            SET p_resultCode = 0; 
        ELSE
            SET p_resultCode = 2001; 
        END IF;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateLotSQL` (IN `p_Id` CHAR(36), IN `p_Designation` LONGTEXT, OUT `p_resultCode` INT)   BEGIN
    DECLARE v_exists INT DEFAULT 0;

  
    SELECT COUNT(*) INTO v_exists
    FROM lots
    WHERE id = p_Id;

    IF v_exists = 0 THEN
        SET p_resultCode = 3001;
    ELSE
       
        UPDATE lots
        SET Designation = p_Designation
        WHERE id = p_Id;

        IF ROW_COUNT() > 0 THEN
            SET p_resultCode = 0; 
        ELSE
            SET p_resultCode = 5000; 
        END IF;
    END IF;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateSupplier` (IN `aId` CHAR(36), IN `aNomPrenom` VARCHAR(100), IN `aNomSociete` VARCHAR(50), IN `aNatureJuridique` VARCHAR(50), IN `aAdresse` VARCHAR(50), IN `aTelephone` VARCHAR(50), IN `aRc` VARCHAR(50), IN `aNif` VARCHAR(50), IN `aRib` VARCHAR(50), IN `aEmail` VARCHAR(50), IN `aAi` VARCHAR(50), IN `aAgenceBancaire` VARCHAR(50), OUT `p_ResultCode` INT)   proc: BEGIN
    DECLARE vErrorCode INT DEFAULT 0;

    -- Error handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_ResultCode = 5000;
    END;

    START TRANSACTION;

    -- 1️⃣ Check if supplier exists and is active
    IF NOT EXISTS (SELECT 1 FROM suppliers WHERE Id = aId AND Status = 1) THEN
        SET p_ResultCode = 2005;
        ROLLBACK;
        LEAVE proc;
    END IF;

    -- 2️⃣ Forbidden updates: RC / NIF / RIB / AI
    IF EXISTS (SELECT 1 FROM suppliers WHERE Id = aId AND Rc IS NOT NULL AND Rc <> '' AND aRc IS NOT NULL AND aRc <> '' AND Rc <> aRc) THEN
        SET p_ResultCode = 2010; ROLLBACK; LEAVE proc;
    END IF;

    IF EXISTS (SELECT 1 FROM suppliers WHERE Id = aId AND Nif IS NOT NULL AND Nif <> '' AND aNif IS NOT NULL AND aNif <> '' AND Nif <> aNif) THEN
        SET p_ResultCode = 2011; ROLLBACK; LEAVE proc;
    END IF;

    IF EXISTS (SELECT 1 FROM suppliers WHERE Id = aId AND Rib IS NOT NULL AND Rib <> '' AND aRib IS NOT NULL AND aRib <> '' AND Rib <> aRib) THEN
        SET p_ResultCode = 2012; ROLLBACK; LEAVE proc;
    END IF;

    IF EXISTS (SELECT 1 FROM suppliers WHERE Id = aId AND Ai IS NOT NULL AND Ai <> '' AND aAi IS NOT NULL AND aAi <> '' AND Ai <> aAi) THEN
        SET p_ResultCode = 2013; ROLLBACK; LEAVE proc;
    END IF;

    -- 3️⃣ Check duplicates (excluding the current supplier)
    SELECT CASE
        WHEN Telephone = aTelephone THEN 1004
        WHEN Email = aEmail THEN 1005
        WHEN Rc = aRc AND aRc IS NOT NULL AND aRc <> '' THEN 1002
        WHEN Nif = aNif AND aNif IS NOT NULL AND aNif <> '' THEN 1003
        WHEN Rib = aRib AND aRib IS NOT NULL AND aRib <> '' THEN 1006
        WHEN Ai = aAi AND aAi IS NOT NULL AND aAi <> '' THEN 1007
        ELSE 0
    END INTO vErrorCode
    FROM suppliers
    WHERE Id <> aId
      AND (
          Telephone = aTelephone
          OR Email = aEmail
          OR (Rc = aRc AND aRc IS NOT NULL AND aRc <> '')
          OR (Nif = aNif AND aNif IS NOT NULL AND aNif <> '')
          OR (Rib = aRib AND aRib IS NOT NULL AND aRib <> '')
          OR (Ai = aAi AND aAi IS NOT NULL AND aAi <> '')
      )
    LIMIT 1;

    IF vErrorCode <> 0 THEN
        SET p_ResultCode = vErrorCode;
        ROLLBACK;
        LEAVE proc;
    END IF;

    -- 4️⃣ Update supplier
    UPDATE suppliers
    SET
        NomPrenom = aNomPrenom,
        NomSociete = aNomSociete,
        NatureJuridique = aNatureJuridique,
        Adresse = aAdresse,
        Telephone = aTelephone,
        Email = aEmail,
        AgenceBancaire = aAgenceBancaire,
        Rc  = CASE WHEN Rc  IS NULL OR Rc  = '' THEN aRc  ELSE Rc  END,
        Nif = CASE WHEN Nif IS NULL OR Nif = '' THEN aNif ELSE Nif END,
        Rib = CASE WHEN Rib IS NULL OR Rib = '' THEN aRib ELSE Rib END,
        Ai  = CASE WHEN Ai  IS NULL OR Ai  = '' THEN aAi ELSE Ai END
    WHERE Id = aId;

    COMMIT;
    SET p_ResultCode = 0;

END proc$$

--
-- Fonctions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `GetAdminByEmail` (`p_email` VARCHAR(255)) RETURNS TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result TEXT;

    SELECT CONCAT(
        '{',
        '"id":"', id, '",',
        '"email":"', email, '",',
        '"password":"', password, '"',
        '}'
    ) INTO result
    FROM admins
    WHERE email = p_email
    LIMIT 1;

    RETURN IFNULL(result, '{}');
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `getAllAnnoncesSQL` (`p_AdminID` CHAR(36)) RETURNS TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result TEXT;

    SELECT CONCAT('[', GROUP_CONCAT(
               CONCAT(
                 '{"Id":"', a.Id,
                 '","Id_Operation":"', a.Id_Operation,
                 '","Numero":"', a.Numero,
                 '","Date_Publication":"', a.Date_Publication,
                 '","Journal":"', a.Journal,
                 '","Delai":"', a.Delai,
                 '","Date_Overture":"', a.Date_Overture,
                 '","Heure_Ouverture":"', a.Heure_Ouverture,
                 '","Status":"', a.Status,
                 '","adminId":"', a.adminId,
                 '","OperationNumero":"', o.Numero,
                 '","Service_Contractant":"', o.Service_Contractant,
                 '","TypeBudget":"', o.TypeBudget,
                 '","ModeAttribuation":"', o.ModeAttribuation,
                 '","Objet":"', o.Objet,
                 '","TypeTravaux":"', o.TypeTravaux,
                 '"}'
               )
           ), ']') INTO result
    FROM annonces a
    INNER JOIN operations o ON a.Id_Operation = o.Id
    WHERE a.adminId = p_AdminID;

    RETURN IFNULL(result, '[]');
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `getAllLotsSQL` (`p_AdminID` CHAR(36)) RETURNS TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result TEXT;

    SELECT CONCAT('[', GROUP_CONCAT(
        CONCAT(
            '{',
            '"id":"', l.id, '",',
            '"NumeroLot":"', l.NumeroLot, '",',
            '"Designation":"', l.Designation, '",',
            '"id_Operation":"', l.id_Operation, '",',
            '"adminId":"', l.adminId, '",',
            '"OperationNumero":"', o.Numero, '",',
            '"Service_Contractant":"', o.Service_Contractant, '",',
            '"TypeBudget":"', o.TypeBudget, '",',
            '"ModeAttribuation":"', o.ModeAttribuation, '",',
            '"Objet":"', o.Objet, '",',
            '"TypeTravaux":"', o.TypeTravaux, '"',
            '}'
        )
    ), ']') INTO result
    FROM lots l
    INNER JOIN operations o ON l.id_Operation = o.Id
    WHERE l.adminId = p_AdminID
      AND o.State = 1;

    RETURN IFNULL(result, '[]');
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `getAllOperationsSQL` (`p_adminID` CHAR(36)) RETURNS TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result TEXT;

    SELECT CONCAT(
        '[',
        GROUP_CONCAT(
            CONCAT(
                '{',
                '"Id":"', Id, '",',
                '"Numero":"', Numero, '",',
                '"Service_Contractant":"', 
                    REPLACE(IFNULL(Service_Contractant,''), '"', '\\"'), '",',
                '"TypeBudget":', TypeBudget, ',',
                '"ModeAttribuation":', ModeAttribuation, ',',
                '"Objet":"', 
                    REPLACE(IFNULL(Objet,''), '"', '\\"'), '",',
                '"TypeTravaux":', TypeTravaux, ',',
                '"State":', State, ',',
                '"NumeroVisa":"', IFNULL(NumeroVisa,''), '",',
                '"DateVisa":"', IFNULL(DateVisa,''), '",',
                '"DateCreation":"', DateCreation, '",',
                '"adminId":"', IFNULL(adminId,''), '"',
                '}'
            )
            ORDER BY DateCreation DESC
        ),
        ']'
    )
    INTO result
    FROM operations
    WHERE adminId = p_adminID;

    RETURN IFNULL(result, '[]');
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `getAllSuppliers` (`p_adminID` CHAR(36)) RETURNS LONGTEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result LONGTEXT;

    SELECT
        CONCAT(
            '[',
            IFNULL(
                GROUP_CONCAT(
                    CONCAT(
                        '{',
                        '"Id":"', IFNULL(f.Id,''), '",',
                        '"NomPrenom":"', IFNULL(REPLACE(REPLACE(f.NomPrenom,'\\','\\\\'),'"','\\"'),''), '",',
                        '"NomSociete":"', IFNULL(REPLACE(REPLACE(f.NomSociete,'\\','\\\\'),'"','\\"'),''), '",',
                        '"NatureJuridique":"', IFNULL(REPLACE(REPLACE(f.NatureJuridique,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Adresse":"', IFNULL(REPLACE(REPLACE(f.Adresse,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Telephone":"', IFNULL(REPLACE(REPLACE(f.Telephone,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Rc":"', IFNULL(REPLACE(REPLACE(f.Rc,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Nif":"', IFNULL(REPLACE(REPLACE(f.Nif,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Rib":"', IFNULL(REPLACE(REPLACE(f.Rib,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Email":"', IFNULL(REPLACE(REPLACE(f.Email,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Ai":"', IFNULL(REPLACE(REPLACE(f.Ai,'\\','\\\\'),'"','\\"'),''), '",',
                        '"AgenceBancaire":"', IFNULL(REPLACE(REPLACE(f.AgenceBancaire,'\\','\\\\'),'"','\\"'),''), '",',
                        '"Status":"', f.Status, '",',
                        '"adminId":"', f.adminId, '"'
                        '}'
                    )
                ),
                ''
            ),
            ']'
        )
    INTO result
    FROM suppliers f
      WHERE f.Status = 1
      AND f.adminId = p_adminID;

    RETURN IFNULL(result, '[]');
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `getSuppliersWithOperations` (`p_adminID` CHAR(36)) RETURNS TEXT CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC BEGIN
    DECLARE result TEXT;

    -- Ajuster la taille maximale de GROUP_CONCAT si besoin
    SET SESSION group_concat_max_len = 1000000;

    SELECT IFNULL(
        CONCAT('[', GROUP_CONCAT(
            JSON_OBJECT(
                'Id', s.Id,
                'NomPrenom', s.NomPrenom,
                'Telephone', s.Telephone,
                'Email', s.Email,
                'SupplierStatus', s.Status,
                'RetraitStatus', r.Status,
                'adminId', s.adminId,
                'NumeroOperation', o.Numero,
                'OperationId', o.Id,
                'ServiceOperation', o.Service_Contractant,
                'ObjectOperation', o.Objet
            )
        ), ']'),
    '[]') INTO result
    FROM suppliers s
    INNER JOIN retrait_cahier_charges r
        ON r.SupplierID = s.Id AND r.Status = 1
    INNER JOIN operations o
        ON o.Id = r.OperationID
    WHERE s.Status = 1
      AND s.adminId = p_adminID
    ORDER BY o.Numero ASC;

    RETURN result;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `admins`
--

CREATE TABLE `admins` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`) VALUES
('14332607-917F-47E3-8165-8A496C12F544', 'malekmerad2003@gmail.com', '9ca613da45c0d0cd77c5768b439ceb5129f8890a1d32ebf54c'),
('bd308877-f89e-11f0-a647-0a002700000d', 'ilyasmadoui2020@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12');

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

CREATE TABLE `annonces` (
  `Id` char(36) NOT NULL,
  `Id_Operation` char(36) NOT NULL,
  `Numero` varchar(10) NOT NULL,
  `Date_Publication` date NOT NULL,
  `Journal` varchar(100) NOT NULL,
  `Delai` int(11) NOT NULL,
  `Date_Overture` date NOT NULL,
  `Heure_Ouverture` time DEFAULT NULL,
  `Status` tinyint(4) DEFAULT 0,
  `adminId` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`Id`, `Id_Operation`, `Numero`, `Date_Publication`, `Journal`, `Delai`, `Date_Overture`, `Heure_Ouverture`, `Status`, `adminId`) VALUES
('29b01ca5-fde4-11f0-9e2c-0a002700000d', '0fe80cfa-fde4-11f0-9e2c-0a002700000d', '005-2026', '2026-01-30', 'Journal 005', 2, '2026-02-01', '16:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('32c3a7ea-fde3-11f0-9e2c-0a002700000d', '0dd57b88-fde3-11f0-9e2c-0a002700000d', '001-2026', '2026-01-30', 'Journal 001', 2, '2026-02-01', '12:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('697863b1-fde4-11f0-9e2c-0a002700000d', '4e2a27de-fde4-11f0-9e2c-0a002700000d', '006-2026', '2026-01-30', 'Journal 006', 2, '2026-02-01', '17:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('9eec2b72-fde3-11f0-9e2c-0a002700000d', '82bb975f-fde3-11f0-9e2c-0a002700000d', '002-2026', '2026-01-30', 'Journal 002', 2, '2026-02-01', '12:38:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('ac0572c1-fde4-11f0-9e2c-0a002700000d', '90bbb9e5-fde4-11f0-9e2c-0a002700000d', '007-2026', '2026-01-30', 'Journal 007', 2, '2026-02-01', '18:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('d1ca7c77-fde3-11f0-9e2c-0a002700000d', 'b5cb371c-fde3-11f0-9e2c-0a002700000d', '003-2026', '2026-01-30', 'Journal 003', 2, '2026-02-01', '14:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('f74b4e76-fde3-11f0-9e2c-0a002700000d', 'e5dda40b-fde3-11f0-9e2c-0a002700000d', '004-2026', '2026-01-30', 'Journal 004', 2, '2026-02-01', '15:00:00', 0, 'bd308877-f89e-11f0-a647-0a002700000d');

-- --------------------------------------------------------

--
-- Structure de la table `lots`
--

CREATE TABLE `lots` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `NumeroLot` varchar(50) NOT NULL,
  `id_Operation` char(36) NOT NULL,
  `Designation` longtext NOT NULL,
  `adminId` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lots`
--

INSERT INTO `lots` (`id`, `NumeroLot`, `id_Operation`, `Designation`, `adminId`) VALUES
('1a48d439-fde3-11f0-9e2c-0a002700000d', 'LOT-001', '0dd57b88-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 001', 'bd308877-f89e-11f0-a647-0a002700000d'),
('1ad308f8-fde4-11f0-9e2c-0a002700000d', 'LOT-005', '0fe80cfa-fde4-11f0-9e2c-0a002700000d', 'Description et Objective 005', 'bd308877-f89e-11f0-a647-0a002700000d'),
('497b9690-fde3-11f0-9e2c-0a002700000d', 'LOT-001-1', '0dd57b88-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 001-1', 'bd308877-f89e-11f0-a647-0a002700000d'),
('5135b429-fde3-11f0-9e2c-0a002700000d', 'LOT-001-2', '0dd57b88-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 001-2', 'bd308877-f89e-11f0-a647-0a002700000d'),
('581c38ca-fde4-11f0-9e2c-0a002700000d', 'LOT-006', '4e2a27de-fde4-11f0-9e2c-0a002700000d', 'Description et Objective 006', 'bd308877-f89e-11f0-a647-0a002700000d'),
('594ed609-fde3-11f0-9e2c-0a002700000d', 'LOT-001-3', '0dd57b88-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 001-3', 'bd308877-f89e-11f0-a647-0a002700000d'),
('8b4be231-fde3-11f0-9e2c-0a002700000d', 'LOT-002', '82bb975f-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 002', 'bd308877-f89e-11f0-a647-0a002700000d'),
('bd72fabc-fde3-11f0-9e2c-0a002700000d', 'LOT-003', 'b5cb371c-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 003', 'bd308877-f89e-11f0-a647-0a002700000d'),
('ec1c8f8b-fde3-11f0-9e2c-0a002700000d', 'LOT-004', 'e5dda40b-fde3-11f0-9e2c-0a002700000d', 'Description et Objective 004', 'bd308877-f89e-11f0-a647-0a002700000d');

-- --------------------------------------------------------

--
-- Structure de la table `operations`
--

CREATE TABLE `operations` (
  `Id` char(36) NOT NULL,
  `Numero` varchar(50) NOT NULL,
  `Service_Contractant` varchar(200) NOT NULL,
  `TypeBudget` tinyint(4) NOT NULL,
  `ModeAttribuation` tinyint(4) NOT NULL,
  `Objet` varchar(500) NOT NULL,
  `TypeTravaux` tinyint(4) NOT NULL,
  `State` tinyint(4) NOT NULL DEFAULT 0,
  `NumeroVisa` varchar(50) DEFAULT NULL,
  `DateVisa` date DEFAULT NULL,
  `DateCreation` timestamp NOT NULL DEFAULT current_timestamp(),
  `adminId` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `operations`
--

INSERT INTO `operations` (`Id`, `Numero`, `Service_Contractant`, `TypeBudget`, `ModeAttribuation`, `Objet`, `TypeTravaux`, `State`, `NumeroVisa`, `DateVisa`, `DateCreation`, `adminId`) VALUES
('0dd57b88-fde3-11f0-9e2c-0a002700000d', '001-2026', 'Direction 001', 2, 2, 'Objective 001', 2, 1, '001/2026', '2026-01-30', '2026-01-30 13:53:02', 'bd308877-f89e-11f0-a647-0a002700000d'),
('0fe80cfa-fde4-11f0-9e2c-0a002700000d', '005-2026', 'Direction 005', 1, 1, 'Objective 005', 1, 1, '005/2026', '2026-01-30', '2026-01-30 14:00:15', 'bd308877-f89e-11f0-a647-0a002700000d'),
('4e2a27de-fde4-11f0-9e2c-0a002700000d', '006-2026', 'Direction 006', 1, 1, 'Objective 006', 1, 1, '006/2026', '2026-01-30', '2026-01-30 14:01:59', 'bd308877-f89e-11f0-a647-0a002700000d'),
('82bb975f-fde3-11f0-9e2c-0a002700000d', '002-2026', 'Direction 002', 1, 1, 'Objective 002', 1, 1, '002/2026', '2026-01-30', '2026-01-30 13:56:18', 'bd308877-f89e-11f0-a647-0a002700000d'),
('90bbb9e5-fde4-11f0-9e2c-0a002700000d', '007-2026', 'Direction 007', 1, 1, 'Objective 007', 1, 0, '007/2026', '2026-01-30', '2026-01-30 14:03:51', 'bd308877-f89e-11f0-a647-0a002700000d'),
('b5cb371c-fde3-11f0-9e2c-0a002700000d', '003-2026', 'Direction 003', 3, 2, 'Objective 003', 3, 1, '003/2026', '2026-01-30', '2026-01-30 13:57:44', 'bd308877-f89e-11f0-a647-0a002700000d'),
('e5dda40b-fde3-11f0-9e2c-0a002700000d', '004-2026', 'Direction 004', 1, 1, 'Objective 004', 1, 1, '004/2026', '2026-01-30', '2026-01-30 13:59:04', 'bd308877-f89e-11f0-a647-0a002700000d'),
('ebfbf540-ff70-11f0-a7b2-0a002700000d', '008-2026', 'Direction 008', 1, 1, 'Objective 008', 1, 1, 'Visa-2026-008', '2026-02-01', '2026-02-01 13:21:15', 'bd308877-f89e-11f0-a647-0a002700000d');

-- --------------------------------------------------------

--
-- Structure de la table `retrait_cahier_charges`
--

CREATE TABLE `retrait_cahier_charges` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `SupplierID` char(36) NOT NULL,
  `OperationID` char(36) NOT NULL,
  `DateRetrait` date NOT NULL,
  `NumeroRetrait` varchar(50) NOT NULL,
  `Status` tinyint(4) NOT NULL,
  `adminId` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `retrait_cahier_charges`
--

INSERT INTO `retrait_cahier_charges` (`id`, `SupplierID`, `OperationID`, `DateRetrait`, `NumeroRetrait`, `Status`, `adminId`) VALUES
('163a0bf7-ff68-11f0-a7b2-0a002700000d', '68d67060-fee0-11f0-a7b2-0a002700000d', '4e2a27de-fde4-11f0-9e2c-0a002700000d', '2026-02-01', '2025-006', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('47c0744b-fee5-11f0-a7b2-0a002700000d', '2000b1a8-fed8-11f0-a7b2-0a002700000d', '0dd57b88-fde3-11f0-9e2c-0a002700000d', '2026-01-31', 'RT-2025-002', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('52481f0e-fee5-11f0-a7b2-0a002700000d', '2000b1a8-fed8-11f0-a7b2-0a002700000d', '82bb975f-fde3-11f0-9e2c-0a002700000d', '2026-01-31', 'RT-2025-003', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('a8047fbb-ff4b-11f0-a7b2-0a002700000d', '68d67060-fee0-11f0-a7b2-0a002700000d', '82bb975f-fde3-11f0-9e2c-0a002700000d', '2026-02-01', '000', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('a8059396-fee1-11f0-a7b2-0a002700000d', '2000b1a8-fed8-11f0-a7b2-0a002700000d', '0dd57b88-fde3-11f0-9e2c-0a002700000d', '2026-01-31', 'RT-2026-001', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('afaa4faa-ff4b-11f0-a7b2-0a002700000d', '68d67060-fee0-11f0-a7b2-0a002700000d', 'e5dda40b-fde3-11f0-9e2c-0a002700000d', '2026-02-01', '0000', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('ccfdee9a-ff64-11f0-a7b2-0a002700000d', '68d67060-fee0-11f0-a7b2-0a002700000d', '4e2a27de-fde4-11f0-9e2c-0a002700000d', '2026-02-01', 'RT-2025-006', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('e484895d-ff68-11f0-a7b2-0a002700000d', '9cfc6c0d-fe27-11f0-9e2c-0a002700000d', '4e2a27de-fde4-11f0-9e2c-0a002700000d', '2026-02-01', '001-00', 1, 'bd308877-f89e-11f0-a647-0a002700000d');

-- --------------------------------------------------------

--
-- Structure de la table `suppliers`
--

CREATE TABLE `suppliers` (
  `Id` char(36) NOT NULL,
  `NomPrenom` varchar(100) DEFAULT NULL,
  `NomSociete` varchar(50) NOT NULL,
  `NatureJuridique` varchar(50) DEFAULT NULL,
  `Adresse` varchar(50) DEFAULT NULL,
  `Telephone` varchar(50) DEFAULT NULL,
  `Rc` varchar(50) DEFAULT NULL,
  `Nif` varchar(50) DEFAULT NULL,
  `Rib` varchar(50) DEFAULT NULL,
  `Email` varchar(50) DEFAULT NULL,
  `Ai` varchar(50) DEFAULT NULL,
  `AgenceBancaire` varchar(50) DEFAULT NULL,
  `Status` tinyint(4) NOT NULL DEFAULT 1,
  `adminId` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `suppliers`
--

INSERT INTO `suppliers` (`Id`, `NomPrenom`, `NomSociete`, `NatureJuridique`, `Adresse`, `Telephone`, `Rc`, `Nif`, `Rib`, `Email`, `Ai`, `AgenceBancaire`, `Status`, `adminId`) VALUES
('1c4447ec-ff62-11f0-a7b2-0a002700000d', 'Daw', 'Sarl 7ay Joued', 'EURL', 'd', '09877665', '436g4356436', '000000000000055678', '46347457467657', 'ghendirmabroukbenalia@gmail.com', '455675475475457', 'bbbbb', 1, '14332607-917F-47E3-8165-8A496C12F544'),
('2000b1a8-fed8-11f0-a7b2-0a002700000d', 'Madoui ilyas ', 'Raison ilyas ', 'EURL', '123 Rue2 Exemple ilyas', '0555123454', '54', '54', '54', 'ilyas@gmail.com', '54', 'PNA', 0, 'bd308877-f89e-11f0-a647-0a002700000d'),
('68d67060-fee0-11f0-a7b2-0a002700000d', 'Merad Malek', 'Raison Malek', 'SARL', '123 Rue2 Exemple Malek', '0555123451', '51', '51', '51', 'Malek@gmail.com', '51', 'Agence Malek', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('9cfc6c0d-fe27-11f0-9e2c-0a002700000d', 'madoui anis', 'Anis Raison', 'SPA', '123 Rue2 Exemple Anis', '0555123450', '50', '50', '50', 'Anis0@example.com', '50', 'Agence 50', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('b3423296-fee0-11f0-a7b2-0a002700000d', 'merad said', 'Raison', 'Entreprise individuelle', 'adresse Said', '0555123452', '52', '52', '52', 'said@gmail.com', '52', 'Agence Said', 1, 'bd308877-f89e-11f0-a647-0a002700000d'),
('feb54afb-fe1b-11f0-9e2c-0a002700000d', 'madoui islam', 'SARL ilyas', 'SNC', '123 Rue2 Exemple ilyas', '0555123455', 'RC 556', 'NIF 556', 'RIB 556', 'ilyas@example.com', 'AI 556', 'Bijaya5', 0, 'bd308877-f89e-11f0-a647-0a002700000d');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_operation` (`Id_Operation`),
  ADD KEY `idx_admin` (`adminId`);

--
-- Index pour la table `lots`
--
ALTER TABLE `lots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_operation` (`id_Operation`),
  ADD KEY `idx_admin` (`adminId`);

--
-- Index pour la table `operations`
--
ALTER TABLE `operations`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Numero` (`Numero`),
  ADD KEY `IX_OPERATIONS_adminId` (`adminId`);

--
-- Index pour la table `retrait_cahier_charges`
--
ALTER TABLE `retrait_cahier_charges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NumeroRetrait` (`NumeroRetrait`),
  ADD KEY `fk_retrait_supplier` (`SupplierID`),
  ADD KEY `fk_retrait_operation` (`OperationID`),
  ADD KEY `idx_adminId` (`adminId`);

--
-- Index pour la table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Rc` (`Rc`),
  ADD UNIQUE KEY `Nif` (`Nif`),
  ADD UNIQUE KEY `uniq_telephone` (`Telephone`),
  ADD UNIQUE KEY `uniq_ai` (`Ai`),
  ADD UNIQUE KEY `uniq_rib` (`Rib`),
  ADD UNIQUE KEY `uniq_email` (`Email`),
  ADD KEY `fk_suppliers_admin` (`adminId`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD CONSTRAINT `fk_annonce_admin` FOREIGN KEY (`adminId`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_annonce_operation` FOREIGN KEY (`Id_Operation`) REFERENCES `operations` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `lots`
--
ALTER TABLE `lots`
  ADD CONSTRAINT `fk_admin` FOREIGN KEY (`adminId`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_operation` FOREIGN KEY (`id_Operation`) REFERENCES `operations` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `operations`
--
ALTER TABLE `operations`
  ADD CONSTRAINT `fk_operations_admin` FOREIGN KEY (`adminId`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `retrait_cahier_charges`
--
ALTER TABLE `retrait_cahier_charges`
  ADD CONSTRAINT `fk_retrait_admin` FOREIGN KEY (`adminId`) REFERENCES `admins` (`id`),
  ADD CONSTRAINT `fk_retrait_operation` FOREIGN KEY (`OperationID`) REFERENCES `operations` (`Id`),
  ADD CONSTRAINT `fk_retrait_supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`Id`);

--
-- Contraintes pour la table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `fk_suppliers_admin` FOREIGN KEY (`adminId`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
