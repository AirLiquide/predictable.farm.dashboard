/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP DATABASE IF EXISTS predictabledata;
CREATE DATABASE predictabledata;

CREATE USER 'predictableuser'@'localhost:7000' IDENTIFIED BY 'predictable';
GRANT ALL PRIVILEGES ON predictabledata.* TO 'predictableuser'@'localhost';
FLUSH PRIVILEGES;

USE predictabledata;

# Zones
DROP TABLE IF EXISTS `zone`;
CREATE TABLE `zone` (
	`id_zone` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` TINYTEXT,
	`location` TINYTEXT,
	`location_gps` TINYTEXT,
	`dashboards` TEXT
)ENGINE=MyISAM;

CREATE TRIGGER new_insert
BEFORE INSERT ON `zone`
FOR EACH ROW
SET NEW.`dashboards` = CASE WHEN NEW.dashboards IS NULL THEN '[]' ELSE NEW.dashboards END
;

# ALTER TABLE `map_message` ADD INDEX `id_machine_index` (`id_machine`);

# Probes
DROP TABLE IF EXISTS `probe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `probe` (
  `id_probe` int(11) NOT NULL AUTO_INCREMENT,
  `id_zone` int(11) DEFAULT NULL,
  `name` tinytext,
  `uuid` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id_probe`),
  UNIQUE KEY `uuid_index` (`uuid`),
  KEY `id_zone_index` (`id_zone`)
) ENGINE=MyISAM AUTO_INCREMENT=177 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `probe` WRITE;
/*!40000 ALTER TABLE `probe` DISABLE KEYS */;
INSERT INTO `probe` VALUES (0,0,'Device 1','1'),(1,0,'Device 2','2'),(2,0,'Device 3','3'),(3,0,'Device 4','4'),(4,0,'Device 5','5'),(5,0,'Device 6','6'),(6,0,'Device 7','7'),(7,0,'Device 8','8'),(8,0,'Device 9','9'),(9,0,'Device 10','10');
/*!40000 ALTER TABLE `probe` ENABLE KEYS */;
UNLOCK TABLES;



--
-- Table structure for table `reading`
--

DROP TABLE IF EXISTS `reading`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reading` (
  `id_sensor` int(11) NOT NULL,
  `value` varchar(32) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `id_sensor_time_index` (`id_sensor`,`time`),
  KEY `id_sensor_index` (`id_sensor`),
  KEY `time_index` (`time`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `sensor`
--

DROP TABLE IF EXISTS `sensor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sensor` (
  `id_sensor` int(11) NOT NULL AUTO_INCREMENT,
  `id_probe` int(11) DEFAULT NULL,
  `type` varchar(32) DEFAULT NULL,
  `last_value` varchar(32) DEFAULT NULL,
  `last_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sort_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_sensor`),
  UNIQUE KEY `id_probe_type_index` (`id_probe`,`type`)
) ENGINE=MyISAM AUTO_INCREMENT=220 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `zone`
--

DROP TABLE IF EXISTS `zone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zone` (
  `id_zone` int(11) NOT NULL AUTO_INCREMENT,
  `name` tinytext,
  `location` tinytext,
  `location_gps` tinytext,
  `dashboards` text,
  PRIMARY KEY (`id_zone`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zone`
--

LOCK TABLES `zone` WRITE;
/*!40000 ALTER TABLE `zone` DISABLE KEYS */;
INSERT INTO `zone` VALUES (0,'Zone par defaut',NULL,NULL,'[]');
/*!40000 ALTER TABLE `zone` ENABLE KEYS */;
UNLOCK TABLES;


-- Dump completed on 2017-02-06 17:49:42
