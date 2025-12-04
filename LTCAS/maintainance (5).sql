-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2025 at 08:16 AM
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
  `image_path` text DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comm`
--

INSERT INTO `comm` (`id`, `sl_no`, `module`, `description`, `action_taken`, `observation`, `remarks`, `image_path`, `riu_info_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'comm', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card.\r\n                    2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', NULL, 100, '2025-12-02 22:48:13', '2025-12-03 03:18:13'),
(2, 2, 'comm', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card.\r\n                  2. Ensure OFC routing is properly done with avoiding 90 degree bending', 'c;lxjcknjdk', '', NULL, 100, '2025-12-02 22:48:13', '2025-12-03 03:18:13'),
(3, 3, 'comm', 'Check the communication status', 'Ensure Tx and Rx LED should Glow/Blink', '', '', NULL, 100, '2025-12-02 22:48:13', '2025-12-03 03:18:13'),
(4, 4, 'comm', 'Visually examine all the communication cables areConnected properly and Communication card had tightened', 'Ensure the tightness of the patch card and communication module.', '', '', NULL, 100, '2025-12-02 22:48:13', '2025-12-03 03:18:13');

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
  `image_path` text DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `loco_info`
--

CREATE TABLE `loco_info` (
  `id` int(11) NOT NULL,
  `zone` varchar(50) NOT NULL,
  `station` varchar(100) NOT NULL,
  `loco` varchar(50) NOT NULL,
  `date` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `image_path` text DEFAULT NULL,
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
(84, 11, 'power', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', NULL, 73, '2025-11-12 07:46:25', '2025-11-12 12:16:25'),
(85, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'po', 'po', 'uploads/images/ECR_DDUD_741_1_1763029355_maintainance(createe).jpg', 75, '2025-11-13 05:52:35', '2025-11-13 10:22:35'),
(86, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 75, '2025-11-13 05:52:35', '2025-11-13 10:22:35'),
(87, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 75, '2025-11-13 05:52:35', '2025-11-13 10:22:35'),
(88, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'po', '', NULL, 76, '2025-11-13 06:00:46', '2025-11-13 10:30:46'),
(89, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 76, '2025-11-13 06:00:46', '2025-11-13 10:30:46'),
(90, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 76, '2025-11-13 06:00:46', '2025-11-13 10:30:46'),
(92, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'po', '', NULL, 78, '2025-11-13 06:13:13', '2025-11-13 10:43:13'),
(93, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 78, '2025-11-13 06:13:13', '2025-11-13 10:43:13'),
(94, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 78, '2025-11-13 06:13:13', '2025-11-13 10:43:13'),
(95, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'dfd', '', NULL, 79, '2025-11-14 00:04:17', '2025-11-14 04:34:17'),
(96, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 79, '2025-11-14 00:04:17', '2025-11-14 04:34:17'),
(97, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 79, '2025-11-14 00:04:17', '2025-11-14 04:34:17'),
(98, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'Checked', 'Good', NULL, 80, '2025-11-14 05:59:17', '2025-11-19 01:40:29'),
(99, 2, 'nms', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', 'hiii', '', NULL, 80, '2025-11-14 05:59:17', '2025-11-19 01:40:29'),
(100, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 80, '2025-11-14 05:59:17', '2025-11-19 01:40:29'),
(101, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'dgdg', 'nbgfd', 'uploads/images/ECR_Gomoh_12245_1_1763375982_maintainance(dashboard.html).jpg', 82, '2025-11-17 06:09:42', '2025-11-17 10:39:42'),
(102, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 82, '2025-11-17 06:09:42', '2025-11-17 10:39:42'),
(103, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 82, '2025-11-17 06:09:42', '2025-11-17 10:39:42'),
(109, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '124', '854', NULL, 83, '2025-11-18 04:28:44', '2025-11-18 08:58:44'),
(110, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 83, '2025-11-18 04:28:44', '2025-11-18 08:58:44'),
(111, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 83, '2025-11-18 04:28:45', '2025-11-18 08:58:45'),
(112, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'ff', 'vdvd', NULL, 84, '2025-11-18 04:41:46', '2025-11-18 09:11:46'),
(113, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 84, '2025-11-18 04:41:46', '2025-11-18 09:11:46'),
(114, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 84, '2025-11-18 04:41:46', '2025-11-18 09:11:46'),
(115, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'lkmkh', 'cvb', NULL, 85, '2025-11-18 04:42:58', '2025-11-18 09:12:58'),
(116, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 85, '2025-11-18 04:42:58', '2025-11-18 09:12:58'),
(117, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 85, '2025-11-18 04:42:58', '2025-11-18 09:12:58'),
(118, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '5124', '', NULL, 86, '2025-11-18 04:44:22', '2025-11-18 09:14:22'),
(119, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 86, '2025-11-18 04:44:22', '2025-11-18 09:14:22'),
(120, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 86, '2025-11-18 04:44:22', '2025-11-18 09:14:22'),
(121, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '', '', NULL, 87, '2025-11-18 04:45:30', '2025-11-18 09:15:30'),
(122, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 87, '2025-11-18 04:45:30', '2025-11-18 09:15:30'),
(123, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 87, '2025-11-18 04:45:30', '2025-11-18 09:15:30'),
(124, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '', '', NULL, 88, '2025-11-18 04:46:19', '2025-11-18 04:46:31'),
(125, 2, 'nms', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', 'ff', NULL, 88, '2025-11-18 04:46:20', '2025-11-18 04:46:32'),
(126, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', 'sfcf', '', NULL, 88, '2025-11-18 04:46:20', '2025-11-18 04:46:32'),
(128, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '5487', '', NULL, 90, '2025-11-19 23:50:25', '2025-11-20 04:20:25'),
(129, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 90, '2025-11-19 23:50:26', '2025-11-20 04:20:26'),
(130, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 90, '2025-11-19 23:50:26', '2025-11-20 04:20:26'),
(131, 1, 'earthing', 'Clean surface of the Earth electrode/MEEB/SEEB', 'Surface should be kept clean', '58', '', NULL, 91, '2025-11-21 00:03:36', '2025-11-21 04:33:36'),
(132, 2, 'earthing', 'Measure the Resistance and fillwater in the Earth Pits to keep low soil resistance', 'Resistance Should be ≤ 2 Ώ', '', '', NULL, 91, '2025-11-21 00:03:36', '2025-11-21 04:33:36'),
(133, 3, 'earthing', 'Check the SPD devices for any signs of physical degradation', 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace it)', '', '', NULL, 91, '2025-11-21 00:03:36', '2025-11-21 04:33:36'),
(134, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'fdgfghfggfh', '', '[\"uploads\\/images\\/ER_Dankuni_5656767_1_692840579ffd8_hbl_logo.jpg\",\"uploads\\/images\\/ER_Dankuni_5656767_1_69284057a0220_maintainance_createe-5_.jpg\"]', 93, '2025-11-27 07:42:50', '2025-11-27 07:43:11'),
(135, 2, 'nms', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', NULL, 93, '2025-11-27 07:42:50', '2025-11-27 07:43:11'),
(136, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 93, '2025-11-27 07:42:50', '2025-11-27 07:43:11'),
(137, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'yhggghgh', '', '[\"uploads\\/images\\/ER_Asansol_565545_1_6928414bf1bba_maintainance_index-1_.jpg\"]', 94, '2025-11-27 07:47:15', '2025-11-27 08:09:25'),
(138, 2, 'nms', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', NULL, 94, '2025-11-27 07:47:16', '2025-11-27 08:09:25'),
(139, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 94, '2025-11-27 07:47:16', '2025-11-27 08:09:25'),
(140, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'hgjfghjjhhj', '', '[\"uploads\\/images\\/ER_Barddhaman_67656_1_692849c0224b0_maintainance_createe-1_.jpg\"]', 96, '2025-11-27 08:23:20', '2025-11-27 12:53:20'),
(141, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 96, '2025-11-27 08:23:20', '2025-11-27 12:53:20'),
(142, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 96, '2025-11-27 08:23:20', '2025-11-27 12:53:20'),
(143, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '54825211', '', '[\"uploads\\/images\\/ECR_DDUD_574152_1_6929227901fb4_maintainance_index_html_.jpg\",\"uploads\\/images\\/ECR_DDUD_574152_1_692922793355b_maintainance_dashboard_html_.jpg\"]', 97, '2025-11-27 23:48:01', '2025-11-28 04:18:01'),
(144, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 97, '2025-11-27 23:48:01', '2025-11-28 04:18:01'),
(145, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 97, '2025-11-27 23:48:01', '2025-11-28 04:18:01'),
(146, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'dfdf', '', NULL, 98, '2025-11-30 22:57:25', '2025-12-01 03:27:25'),
(147, 2, 'nms', 'Backup the Events &amp; Fault data logs of RIU', 'Store the log files &amp; Downloaded data from Google drive', '', '', NULL, 98, '2025-11-30 22:57:25', '2025-12-01 03:27:25'),
(148, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 98, '2025-11-30 22:57:25', '2025-12-01 03:27:25'),
(149, 1, 'nms', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '.', '', NULL, 99, '2025-12-01 00:30:10', '2025-12-01 01:05:32'),
(150, 2, 'nms', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', NULL, 99, '2025-12-01 00:30:10', '2025-12-01 01:05:33'),
(151, 3, 'nms', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', NULL, 99, '2025-12-01 00:30:10', '2025-12-01 01:05:33');

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
  `image_path` text DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `power`
--

INSERT INTO `power` (`id`, `sl_no`, `module`, `description`, `action_taken`, `observation`, `remarks`, `image_path`, `riu_info_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'power', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', 'fbfgdgd', '', '[\"uploads\\/images\\/ER_Dankuni_5656767_1_69284062b476f_maintainance_dashboard_html_.jpg\"]', 93, '2025-11-27 07:43:22', '2025-11-27 12:13:22'),
(2, 2, 'power', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', 'fghggg', '', NULL, 93, '2025-11-27 07:43:22', '2025-11-27 12:13:22'),
(3, 3, 'power', 'Check the Power voltages at Equipment End of Ch-A &amp; Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', NULL, 93, '2025-11-27 07:43:22', '2025-11-27 12:13:22'),
(4, 4, 'power', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', NULL, 93, '2025-11-27 07:43:22', '2025-11-27 12:13:22'),
(5, 5, 'power', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(6, 6, 'power', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(7, 7, 'power', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(8, 8, 'power', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(9, 9, 'power', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(10, 10, 'power', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(11, 11, 'power', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', NULL, 93, '2025-11-27 07:43:23', '2025-11-27 12:13:23'),
(12, 1, 'power', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', 'jijhhj', '', NULL, 97, '2025-11-27 23:48:17', '2025-11-28 04:18:17'),
(13, 2, 'power', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(14, 3, 'power', 'Check the Power voltages at Equipment End of Ch-A &amp; Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(15, 4, 'power', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(16, 5, 'power', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(17, 6, 'power', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(18, 7, 'power', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(19, 8, 'power', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(20, 9, 'power', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', NULL, 97, '2025-11-27 23:48:18', '2025-11-28 04:18:18'),
(21, 10, 'power', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', NULL, 97, '2025-11-27 23:48:19', '2025-11-28 04:18:19'),
(22, 11, 'power', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', NULL, 97, '2025-11-27 23:48:19', '2025-11-28 04:18:19');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `station` varchar(100) DEFAULT NULL,
  `riu_no` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `zone`, `station`, `riu_no`, `file_name`, `version`, `created_at`, `file_path`) VALUES
(20, 'ECR', 'Gomoh', '88487', 'RIU_ECR_Gomoh_88487_NotCompleted_2025-12-01_10-30-18.pdf', 1, '2025-12-01 05:00:18', 'reports/RIU_ECR_Gomoh_88487_NotCompleted_2025-12-01_10-30-18.pdf'),
(21, 'ECR', 'Patratu', '4578', 'RIU_ECR_Patratu_4578_NotCompleted_2025-12-03_08-48-20.pdf', 1, '2025-12-03 03:18:20', 'reports/RIU_ECR_Patratu_4578_NotCompleted_2025-12-03_08-48-20.pdf');

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
  `image_path` text DEFAULT NULL,
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
('ECR', 'cbjvd', 8745, 2545, 79),
('ECR', 'DDUD', 12, 12, 73),
('ECR', 'DDUD', 69, 69, 72),
('ECR', 'DDUD', 74, 74, 70),
('ECR', 'DDUD', 78, 78, 74),
('ECR', 'DDUD', 448, 364585, 78),
('ECR', 'DDUD', 741, 741, 75),
('ECR', 'DDUD', 1235, 8541, 80),
('ECR', 'DDUD', 8157, 41248, 89),
('ECR', 'DDUD', 8415, 7454, 71),
('ECR', 'DDUD', 78478, 201254102, 90),
('ECR', 'DDUD', 574152, 87412, 97),
('ECR', 'DDUE', 7, 7, 76),
('ECR', 'DDUE', 45, 5, 77),
('ECR', 'DDUE', 45, 251, 81),
('ECR', 'DDUE', 12514, 221, 92),
('ECR', 'Gomoh', 542, 557, 91),
('ECR', 'Gomoh', 2024, 12454, 88),
('ECR', 'Gomoh', 7554, 1545, 86),
('ECR', 'Gomoh', 12245, 414, 82),
('ECR', 'Gomoh', 45457, 1244, 87),
('ECR', 'Gomoh', 78454, 120574, 85),
('ECR', 'Gomoh', 78547, 24, 98),
('ECR', 'Gomoh', 88487, 417, 99),
('ECR', 'Patratu', 4578, 22558, 100),
('ECR', 'Patratu', 10147, 78515, 84),
('ECR', 'Patratu', 78454, 18795, 83),
('ER', 'Asansol', 565545, 6454565, 94),
('ER', 'Barddhaman', 67656, 675567657, 96),
('ER', 'Barddhaman', 54654554, 54454554, 95),
('ER', 'Dankuni', 5656767, 57675, 93);

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
-- Indexes for table `locomotive`
--
ALTER TABLE `locomotive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_loco` (`loco`);

--
-- Indexes for table `loco_info`
--
ALTER TABLE `loco_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loco` (`loco`);

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
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `earthing`
--
ALTER TABLE `earthing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locomotive`
--
ALTER TABLE `locomotive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `loco_info`
--
ALTER TABLE `loco_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `nms`
--
ALTER TABLE `nms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT for table `power`
--
ALTER TABLE `power`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `riu_equip`
--
ALTER TABLE `riu_equip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `riu_info`
--
ALTER TABLE `riu_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

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
-- Constraints for table `locomotive`
--
ALTER TABLE `locomotive`
  ADD CONSTRAINT `fk_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;

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
