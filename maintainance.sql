-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 31, 2025 at 12:45 PM
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
('ECR', 'DDUD', 8, 8, 37),
('ECR', 'DDUD', 321, 321, 40),
('ECR', 'DDUD', 123456, 123456, 34),
('ECR', 'DDUE', 8, 8, 39),
('ECR', 'DDUE', 3652531, 514564, 33),
('ECR', 'Gomoh', 74, 74, 36),
('ECR', 'Gomoh', 7845157, 654545114, 38),
('ECR', 'Patratu', 1234, 1234, 35);

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

--
-- Dumping data for table `riu_monthly_data`
--

INSERT INTO `riu_monthly_data` (`id`, `sl_no`, `location`, `description`, `action_taken_range`, `observation`, `remarks`, `riu_info_id`) VALUES
(241, 1, 'NMS', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '4515', 'hi', 36),
(242, 2, 'NMS', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', 36),
(243, 3, 'NMS', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', 36),
(244, 4, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', '', '', 36),
(245, 5, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', 36),
(246, 6, 'Power Supply (LC Gate / Junction Cabins / IB Location Box / IB Hut or IB Room)', 'Ensure Charger / DC–DC Modules indication should Glow.', 'LED Indications should glow.\nBATTERY CHARGER I/P ON\nBATTERY CHARGER O/P ON', '', '', 36),
(247, 7, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Power voltages at Equipment End of Ch-A & Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', 36),
(248, 8, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', 36),
(249, 9, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', 36),
(250, 10, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', 36),
(251, 11, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', 36),
(252, 12, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', 36),
(253, 13, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', 36),
(254, 14, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', 36),
(255, 15, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', 36),
(256, 16, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Clean the RIU Equipment. Check the communication status of the RIU COM1 & RIU COM2 Modules', 'To be free from dust\nLEDs should be Glow/Blink\nPWR LED\nMHLT LED\nWHLT LED\nDATA1 LED\nDATA2 LED\nCH1/LINK1 LED\nCH2/LINK2 LED\nBMS LED\nCNS LED\nBHLT LED', '', '', 36),
(257, 17, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check all Health Status LEDs, i.eRIU – FSC Module', 'LEDs should be Glow/Blink\nPWR LED\nSCS LED\nWHLT LED\nADC LED\nMHLT LED', '', '', 36),
(258, 18, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the Power Supply Module -RIU', 'LEDs should be Glow/Blink\nPWR LED\nCAN LED\nISO LED', '', '', 36),
(259, 19, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all the cards are inserted properly and tighten the corresponding screws', 'Ensure the tightness of the cards', '', '', 36),
(260, 20, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all PS, communication cables are tighten all the connections / Terminations / Wagoterminals', 'Ensure the tightness of the cables connectors', '', '', 36),
(261, 21, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the RIU Internal and External wirings', '1. Check the firmness of wiring Connections from FSC module to Rly. FieldInputs. 2.Check the firmness ofCommunication cable connections between RIU communication to F M S Unit 3.Check the firmness of wiring connections between Battery Charger .', '', '', 36),
(262, 22, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the output Supply voltage of 24 Volts charger provided for relay input wiring', 'The voltage measured should be approx. 21V - 29V DC.', '', '', 36),
(263, 23, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check voltage from contacts of field input relays at terminals. witred to RIU.', 'The voltage on the terminals when the relay is picked up should be between 20 to 29V DC.', '', '', 36),
(264, 24, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 36),
(265, 25, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 36),
(266, 26, 'Communication Module', 'Check the communication status', 'Ensure Tx and Rx LED should Glow/Blink', '', '', 36),
(267, 27, 'Communication Module', 'Visually examine all the communication cables areConnected properly and Communication card had tightened', 'Ensure the tightness of the patch card and communication module.', '', '', 36),
(268, 28, 'Earthing & SPD', 'Clean surface of the Earth electrode/MEEB/SEEB', 'Surface should be kept clean', '', '', 36),
(269, 29, 'Earthing & SPD', 'Measure the Resistance and fillwater in the Earth Pits to keep low soil resistance', 'Resistance Should be ≤ 2 Ώ', '', '', 36),
(270, 30, 'Earthing & SPD', 'Check the SPD devices for any signs of physical degradation', 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace it)', '', '', 36),
(271, 1, 'NMS', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', '', '', 39),
(272, 2, 'NMS', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', 39),
(273, 3, 'NMS', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', 39),
(274, 4, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', '', '', 39),
(275, 5, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', 39),
(276, 7, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Power voltages at Equipment End of Ch-A & Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', 39),
(277, 8, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', 39),
(278, 9, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', 39),
(279, 10, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', 39),
(280, 11, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', 39),
(281, 12, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', 39),
(282, 13, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', 39),
(283, 14, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', 39),
(284, 15, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', 39),
(285, 19, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all the cards are inserted properly and tighten the corresponding screws', 'Ensure the tightness of the cards', '', '', 39),
(286, 20, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all PS, communication cables are tighten all the connections / Terminations / Wagoterminals', 'Ensure the tightness of the cables connectors', '', '', 39),
(287, 21, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the RIU Internal and External wirings', '1. Check the firmness of wiring Connections from FSC module to Rly. FieldInputs. 2.Check the firmness ofCommunication cable connections between RIU communication to F M S Unit 3.Check the firmness of wiring connections between Battery Charger .', '', '', 39),
(288, 22, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the output Supply voltage of 24 Volts charger provided for relay input wiring', 'The voltage measured should be approx. 21V - 29V DC.', '', '', 39),
(289, 23, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check voltage from contacts of field input relays at terminals. witred to RIU.', 'The voltage on the terminals when the relay is picked up should be between 20 to 29V DC.', '', '', 39),
(290, 24, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 39),
(291, 25, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 39),
(292, 26, 'Communication Module', 'Check the communication status', 'Ensure Tx and Rx LED should Glow/Blink', '', '', 39),
(293, 27, 'Communication Module', 'Visually examine all the communication cables areConnected properly and Communication card had tightened', 'Ensure the tightness of the patch card and communication module.', '', '', 39),
(294, 28, 'Earthing & SPD', 'Clean surface of the Earth electrode/MEEB/SEEB', 'Surface should be kept clean', '', '', 39),
(295, 29, 'Earthing & SPD', 'Measure the Resistance and fillwater in the Earth Pits to keep low soil resistance', 'Resistance Should be ≤ 2 Ώ', '', '', 39),
(296, 30, 'Earthing & SPD', 'Check the SPD devices for any signs of physical degradation', 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace it)', '', '', 39),
(297, 1, 'NMS', 'Ensure E1 network is always healthy and RIU communication is stable.', 'Verify communication with STCAS unit.', 'hi', 'hello', 40),
(298, 2, 'NMS', 'Backup the Events & Fault data logs of RIU', 'Store the log files & Downloaded data from Google drive', '', '', 40),
(299, 3, 'NMS', 'Ensure RIU inputs are operated', 'Check all the RIU field inputs (Signals, Points, Track circuits, etc.,) are operated properly in NMS.', '', '', 40),
(300, 4, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Voltage level at 230 v AC Mains input voltage to both the Battery chargers', '220 - 260V AC', '', '', 40),
(301, 5, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the working of the A/C input supply monitoring relay for both the channels of A/C 230 V supply input to RIU', 'Ensure that the A/C supply monitoring relays are in ON condition when A/C power in available.', '', '', 40),
(302, 7, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the Power voltages at Equipment End of Ch-A & Ch-B', 'The voltage shall be in the range of 22V to 26.5V', '', '', 40),
(303, 8, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the mounting arrangementof Input fuse(If Any)', 'Ensure fuses are fastened securely', '', '', 40),
(304, 9, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the output Power Supplyvoltage for both Battery charger bank', '21.6 ~ 28.8V DC to be observed for final O/P Voltage for both battery banks.', '', '', 40),
(305, 10, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the connections of the diodes in the charging path from both the battery charger output to batteries.', 'Ensure that the diodesare firmly connected to TB1 and TB2 in channel 1 and TB3 and TB4 in channel 2 respectively.', '', '', 40),
(306, 11, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'To check that RIU battery back up is available.', 'Switch OFF MCBs, ensure that RIU works on battery back up.', '', '', 40),
(307, 12, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Clean the Battery Charger and Batteries', 'To be free from dust', '', '', 40),
(308, 13, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of INTERNAL (RIU) Supply', '21.6V to 28.8V DCto be observed', '', '', 40),
(309, 14, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the voltages at Equipment end of EXTERNAL', '21.6V to 28.8V DCto be observed', '', '', 40),
(310, 15, 'Power Supply (LC Gate/Junction Cabins/ IB Location Box/ IB Hut or IB Room)', 'Check the all wago fuse indications', 'Disconnect type fuse wago indications should not glow', '', '', 40),
(311, 19, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all the cards are inserted properly and tighten the corresponding screws', 'Ensure the tightness of the cards', '', '', 40),
(312, 20, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Visually examine all PS, communication cables are tighten all the connections / Terminations / Wagoterminals', 'Ensure the tightness of the cables connectors', '', '', 40),
(313, 21, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the RIU Internal and External wirings', '1. Check the firmness of wiring Connections from FSC module to Rly. FieldInputs. 2.Check the firmness ofCommunication cable connections between RIU communication to F M S Unit 3.Check the firmness of wiring connections between Battery Charger .', '', '', 40),
(314, 22, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check the output Supply voltage of 24 Volts charger provided for relay input wiring', 'The voltage measured should be approx. 21V - 29V DC.', '', '', 40),
(315, 23, 'RIU Equipment (LC Gate/ Junction Cabins/ IB Location Box/ IB Hut or Room)', 'Check voltage from contacts of field input relays at terminals. witred to RIU.', 'The voltage on the terminals when the relay is picked up should be between 20 to 29V DC.', '', '', 40),
(316, 24, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 40),
(317, 25, 'Communication Module', 'Check the Quad/OFC', '1. Check the firmness of wiring/OFC patch card termination to communication card. 2. Ensure OFC routing is properly done with avoiding 90 degree bending', '', '', 40),
(318, 26, 'Communication Module', 'Check the communication status', 'Ensure Tx and Rx LED should Glow/Blink', '', '', 40),
(319, 27, 'Communication Module', 'Visually examine all the communication cables areConnected properly and Communication card had tightened', 'Ensure the tightness of the patch card and communication module.', '', '', 40),
(320, 28, 'Earthing & SPD', 'Clean surface of the Earth electrode/MEEB/SEEB', 'Surface should be kept clean', '', '', 40),
(321, 29, 'Earthing & SPD', 'Measure the Resistance and fillwater in the Earth Pits to keep low soil resistance', 'Resistance Should be ≤ 2 Ώ', '', '', 40),
(322, 30, 'Earthing & SPD', 'Check the SPD devices for any signs of physical degradation', 'Check the Indication LED status of SPD. (If SPD indicates FAIL then replace it)', '', '', 40);

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
(4, '52667', 'surya', 'ECR', '8328578878', '52667', 'admin');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for table `riu_info`
--
ALTER TABLE `riu_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=323;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  ADD CONSTRAINT `riu_monthly_data_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
