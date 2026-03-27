-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2025 at 08:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maintainance`
--

-- --------------------------------------------------------

--
-- Table structure for table `locomotive`
--

CREATE TABLE `locomotive` (
  `id` int(11) NOT NULL,
  `sno` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `parameter` text DEFAULT NULL,
  `cab1` text DEFAULT NULL,
  `cab2` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `trip` tinyint(1) DEFAULT NULL,
  `ia_ib` tinyint(1) DEFAULT NULL,
  `ic` tinyint(1) DEFAULT NULL,
  `toh_aoh` tinyint(1) DEFAULT NULL,
  `ioh_poh` tinyint(1) DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `locomotive`
--
ALTER TABLE `locomotive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_loco` (`loco`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `locomotive`
--
ALTER TABLE `locomotive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `locomotive`
--
ALTER TABLE `locomotive`
  ADD CONSTRAINT `fk_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
