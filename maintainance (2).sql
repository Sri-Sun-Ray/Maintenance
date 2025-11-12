-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2025 at 01:21 PM
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
-- Table structure for table `comm`
--

CREATE TABLE `comm` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `action_taken` text NOT NULL,
  `observation` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `earthing`
--

CREATE TABLE `earthing` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `action_taken` text NOT NULL,
  `observation` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nms`
--

CREATE TABLE `nms` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `action_taken` text NOT NULL,
  `observation` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nms`
--

INSERT INTO `nms` (`id`, `sl_no`, `module`, `description`, `action_taken`, `observation`, `remarks`, `image_path`, `riu_info_id`, `created_at`, `updated_at`) VALUES
(42, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '45', '45', NULL, 70, '2025-11-12 07:07:02', '2025-11-12 11:37:02'),
(43, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 70, '2025-11-12 07:07:03', '2025-11-12 11:37:03'),
(44, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 70, '2025-11-12 07:07:03', '2025-11-12 11:37:03'),
(45, 1, 'power', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', '4512', '', NULL, 70, '2025-11-12 07:07:09', '2025-11-12 11:37:09'),
(46, 2, 'power', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(47, 3, 'power', 'Check the Power voltages at Equipment End of Ch-A &amp; Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(48, 4, 'power', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(49, 5, 'power', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(50, 6, 'power', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(51, 7, 'power', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(52, 8, 'power', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(53, 9, 'power', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(54, 10, 'power', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(55, 11, 'power', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', NULL, 70, '2025-11-12 07:07:10', '2025-11-12 11:37:10'),
(56, 1, 'earthing', 'Clean surface of the Earth electrode/MEEB/SEEB', 'Surface should be kept clean', 'hi', '', NULL, 70, '2025-11-12 07:07:23', '2025-11-12 11:37:23'),
(57, 2, 'earthing', 'Measure the Resistance and fillwater in the Earth Pits to keep low soil resistance', 'Resistance Should be ≤ 2 Ώ', '', '', NULL, 70, '2025-11-12 07:07:23', '2025-11-12 11:37:23'),
(58, 3, 'earthing', 'Check the SPD devices for any signs of physical degradation', 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace it)', '', '', NULL, 70, '2025-11-12 07:07:23', '2025-11-12 11:37:23'),
(60, 1, 'comm', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card.\r\n                    2. Ensure OFC routing is properly done with avoiding 90 degree bending', 'dd', '', NULL, 70, '2025-11-12 07:07:34', '2025-11-12 11:37:34'),
(61, 2, 'comm', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card.\r\n                  2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', NULL, 70, '2025-11-12 07:07:34', '2025-11-12 11:37:34'),
(62, 3, 'comm', 'Check the communication status', 'Ensure Tx and Rx LED should Glow/Blink', '', '', NULL, 70, '2025-11-12 07:07:34', '2025-11-12 11:37:34'),
(63, 4, 'comm', 'Visually examine all the communication cables areConnected properly and Communication card had tightened', 'Ensure the tightness of the patch card and communication module.', '', '', NULL, 70, '2025-11-12 07:07:34', '2025-11-12 11:37:34'),
(65, 1, 'riu_equip', 'Visually examine all the cards are inserted properly and tighten the corresponding screws', 'Ensure the tightness of the cards', 'fcd', '', NULL, 70, '2025-11-12 07:07:44', '2025-11-12 11:37:44'),
(66, 2, 'riu_equip', 'Visually examine all PS, communication cables are tighten all the connections / Terminations / Wagoterminals', 'Ensure the tightness of the cables connectors', '', '', NULL, 70, '2025-11-12 07:07:44', '2025-11-12 11:37:44'),
(67, 3, 'riu_equip', 'Check the RIU Internal and External wirings', '1. Check the firmness of wiring Connections from FSC module to Rly. FieldInputs.\r\n                2.Check the firmness ofCommunication cable connections between RIU communication to F M S Unit\r\n                3.Check the firmness of wiring connections between Battery Charger .', '', '', NULL, 70, '2025-11-12 07:07:44', '2025-11-12 11:37:44'),
(68, 4, 'riu_equip', 'Check the output Supply voltage of 24 Volts charger provided for relay input wiring', 'The voltage measured should be approx. 21V - 29V DC.', '', '', NULL, 70, '2025-11-12 07:07:44', '2025-11-12 11:37:44'),
(69, 5, 'riu_equip', 'Check voltage from contacts of field input relays at terminals. witred to RIU.', 'The voltage on the terminals when the relay is picked up should be between 20 to 29V DC.', '', '', NULL, 70, '2025-11-12 07:07:44', '2025-11-12 11:37:44'),
(71, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'po', 'po', NULL, 73, '2025-11-12 07:45:28', '2025-11-12 12:15:28'),
(72, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 73, '2025-11-12 07:45:28', '2025-11-12 12:15:28'),
(73, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 73, '2025-11-12 07:45:29', '2025-11-12 12:15:29'),
(74, 1, 'power', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', 'po', 'po', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(75, 2, 'power', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(76, 3, 'power', 'Check the Power voltages at Equipment End of Ch-A &amp; Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(77, 4, 'power', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(78, 5, 'power', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(79, 6, 'power', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(80, 7, 'power', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(81, 8, 'power', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(82, 9, 'power', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(83, 10, 'power', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(84, 11, 'power', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25');

-- --------------------------------------------------------

--
-- Table structure for table `power`
--

CREATE TABLE `power` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `action_taken` text NOT NULL,
  `observation` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riu_equip`
--

CREATE TABLE `riu_equip` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `action_taken` text NOT NULL,
  `observation` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riu_info`
--

CREATE TABLE `riu_info` (
  `zone` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `station` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `riu_no` bigint(30) NOT NULL,
  `riu_equip_no` bigint(30) NOT NULL,
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `riu_info`
--

INSERT INTO `riu_info` (`zone`, `station`, `riu_no`, `riu_equip_no`, `id`) VALUES
('ECR', 'DDUD', 12, 12, 73),
('ECR', 'DDUD', 69, 69, 72),
('ECR', 'DDUD', 74, 74, 70),
('ECR', 'DDUD', 8415, 7454, 71);

-- --------------------------------------------------------

--
-- Table structure for table `riu_monthly_data`
--

CREATE TABLE `riu_monthly_data` (
  `id` int(11) NOT NULL,
  `sl_no` int(11) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `action_taken_range` varchar(255) NOT NULL,
  `observation` text NOT NULL,
  `remarks` text NOT NULL,
  `riu_info_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `Zone` varchar(25) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` enum('admin','user') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `employee_name`, `Zone`, `phone_number`, `password`, `role`) VALUES
(4, '52667', 'surya', 'ECR', '8328578878', '52667', 'admin'),
(5, '52447', 'sushma', 'ER', '8074138452', '52447', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comm`
--
ALTER TABLE `comm`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_module_record` (`sl_no`,`module`,`riu_info_id`),
  ADD KEY `riu_info_id` (`riu_info_id`),
  ADD KEY `module` (`module`),
  ADD KEY `sl_no` (`sl_no`);

--
-- Indexes for table `earthing`
--
ALTER TABLE `earthing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_module_record` (`sl_no`,`module`,`riu_info_id`),
  ADD KEY `riu_info_id` (`riu_info_id`),
  ADD KEY `module` (`module`),
  ADD KEY `sl_no` (`sl_no`);

--
-- Indexes for table `nms`
--
ALTER TABLE `nms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_module_record` (`sl_no`,`module`,`riu_info_id`),
  ADD KEY `riu_info_id` (`riu_info_id`),
  ADD KEY `module` (`module`),
  ADD KEY `sl_no` (`sl_no`);

--
-- Indexes for table `power`
--
ALTER TABLE `power`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_module_record` (`sl_no`,`module`,`riu_info_id`),
  ADD KEY `riu_info_id` (`riu_info_id`),
  ADD KEY `module` (`module`),
  ADD KEY `sl_no` (`sl_no`);

--
-- Indexes for table `riu_equip`
--
ALTER TABLE `riu_equip`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_module_record` (`sl_no`,`module`,`riu_info_id`),
  ADD KEY `riu_info_id` (`riu_info_id`),
  ADD KEY `module` (`module`),
  ADD KEY `sl_no` (`sl_no`);

--
-- Indexes for table `riu_info`
--
ALTER TABLE `riu_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_riu` (`zone`,`station`,`riu_no`,`riu_equip_no`);

--
-- Indexes for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `riu_info_id` (`riu_info_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comm`
--
ALTER TABLE `comm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `earthing`
--
ALTER TABLE `earthing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nms`
--
ALTER TABLE `nms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `power`
--
ALTER TABLE `power`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `riu_equip`
--
ALTER TABLE `riu_equip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `riu_info`
--
ALTER TABLE `riu_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=349;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comm`
--
ALTER TABLE `comm`
  ADD CONSTRAINT `comm_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `earthing`
--
ALTER TABLE `earthing`
  ADD CONSTRAINT `earthing_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `nms`
--
ALTER TABLE `nms`
  ADD CONSTRAINT `nms_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `power`
--
ALTER TABLE `power`
  ADD CONSTRAINT `power_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `riu_equip`
--
ALTER TABLE `riu_equip`
  ADD CONSTRAINT `riu_equip_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  ADD CONSTRAINT `riu_monthly_data_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
