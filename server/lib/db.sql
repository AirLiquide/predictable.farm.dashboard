DROP DATABASE IF EXISTS predictabledata;
CREATE DATABASE predictabledata;

CREATE USER 'predictableuser'@'localhost' IDENTIFIED BY 'predictable';
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
	`dashboards` TEXT DEFAULT "[]"
)ENGINE=MyISAM;

INSERT INTO zone
SET id_zone=0,
	name="Zone par défaut";

INSERT INTO zone
SET id_zone=1,
	name="Serre Expérimentale",
	location="Molondin, Suisse",
	location_gps="46.759868,6.745960",
	dashboards="[]";

# ALTER TABLE `map_message` ADD INDEX `id_machine_index` (`id_machine`);

# Probes
DROP TABLE IF EXISTS `probe`;
CREATE TABLE `probe` (
	`id_probe` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`id_zone` INT NULL,
	`name` TINYTEXT,
	`uuid` VARCHAR(32)
)ENGINE=MyISAM;

ALTER TABLE `probe` ADD INDEX `id_zone_index` (`id_zone`);
ALTER TABLE `probe` ADD UNIQUE INDEX `uuid_index` (`uuid`);

# Machines
DROP TABLE IF EXISTS `sensor`;
CREATE TABLE `sensor` (
	`id_sensor` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`id_probe` INT NULL,
	`type` VARCHAR(32),
	`last_value` VARCHAR(32) NULL,
	`last_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`sort_order` INT NULL
)ENGINE=MyISAM;

ALTER TABLE `sensor` ADD INDEX `id_probe_index` (`id_user_owner`);
ALTER TABLE `sensor` ADD UNIQUE INDEX `id_probe_type_index` (`id_probe`, `type`);

DROP TABLE IF EXISTS `reading`;
CREATE TABLE `reading` (
	`id_sensor` INT NOT NULL,
	`value` VARCHAR(32) NOT NULL,
	`time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=MyISAM;

ALTER TABLE `reading` ADD INDEX `id_sensor_index` (`id_sensor`);
ALTER TABLE `reading` ADD INDEX `time_index` (`time`);
ALTER TABLE `reading` ADD UNIQUE INDEX `id_sensor_time_index` (`id_sensor`, `time`);
