-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2026 at 08:14 AM
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
-- Table structure for table `brake_interface`
--

CREATE TABLE `brake_interface` (
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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_path` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `daily_monthly`
--

CREATE TABLE `daily_monthly` (
  `id` int(11) NOT NULL,
  `s_no` int(11) NOT NULL,
  `station_info_id` int(11) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `maintenance_task_description` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `action_taken` varchar(255) DEFAULT NULL,
  `equipment_condition` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `image_path` text DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fie_info`
--

CREATE TABLE `fie_info` (
  `id` int(11) NOT NULL,
  `zone` varchar(25) NOT NULL,
  `station` varchar(25) NOT NULL,
  `fie_no` bigint(30) NOT NULL,
  `fie_equip_no` bigint(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_path` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locomotive_avail`
--

CREATE TABLE `locomotive_avail` (
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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Table structure for table `ltcas_reports`
--

CREATE TABLE `ltcas_reports` (
  `id` int(11) NOT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `station` varchar(100) DEFAULT NULL,
  `loco` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(255) DEFAULT NULL
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
  `image_path` text DEFAULT NULL,
  `riu_info_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `quarterly_check`
--

CREATE TABLE `quarterly_check` (
  `id` int(11) NOT NULL,
  `s_no` int(11) NOT NULL,
  `station_info_id` int(11) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `name_number` varchar(255) DEFAULT NULL,
  `date_commission` date DEFAULT NULL,
  `required_value` varchar(255) DEFAULT NULL,
  `observed_value` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quarterly_half`
--

CREATE TABLE `quarterly_half` (
  `id` int(11) NOT NULL,
  `s_no` int(11) NOT NULL,
  `station_info_id` int(11) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `maintenance_task_description` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `action_taken` varchar(255) DEFAULT NULL,
  `equipment_condition` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `image_path` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `roof`
--

CREATE TABLE `roof` (
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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station_info`
--

CREATE TABLE `station_info` (
  `id` int(11) NOT NULL,
  `zone` varchar(100) NOT NULL,
  `station` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station_reports`
--

CREATE TABLE `station_reports` (
  `id` int(11) NOT NULL,
  `zone` varchar(100) DEFAULT NULL,
  `station` varchar(100) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `underframe`
--

CREATE TABLE `underframe` (
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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `underframe2`
--

CREATE TABLE `underframe2` (
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
  `image_paths` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `loco` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Indexes for dumped tables
--

--
-- Indexes for table `brake_interface`
--
ALTER TABLE `brake_interface`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_brake_loco` (`loco`);

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
-- Indexes for table `daily_monthly`
--
ALTER TABLE `daily_monthly`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_row` (`station_info_id`,`s_no`,`module`);

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
-- Indexes for table `fie_info`
--
ALTER TABLE `fie_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locomotive`
--
ALTER TABLE `locomotive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_loco` (`loco`);

--
-- Indexes for table `locomotive_avail`
--
ALTER TABLE `locomotive_avail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_loco_avail_loco` (`loco`);

--
-- Indexes for table `loco_info`
--
ALTER TABLE `loco_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loco` (`loco`),
  ADD UNIQUE KEY `loco_2` (`loco`);

--
-- Indexes for table `ltcas_reports`
--
ALTER TABLE `ltcas_reports`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `quarterly_check`
--
ALTER TABLE `quarterly_check`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_row` (`station_info_id`,`s_no`,`module`);

--
-- Indexes for table `quarterly_half`
--
ALTER TABLE `quarterly_half`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_row` (`station_info_id`,`s_no`,`module`);

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
-- Indexes for table `roof`
--
ALTER TABLE `roof`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_roof_loco` (`loco`);

--
-- Indexes for table `station_info`
--
ALTER TABLE `station_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_station_date` (`zone`,`station`,`date`);

--
-- Indexes for table `station_reports`
--
ALTER TABLE `station_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `underframe`
--
ALTER TABLE `underframe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_underframe_loco` (`loco`);

--
-- Indexes for table `underframe2`
--
ALTER TABLE `underframe2`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_underframe2_loco` (`loco`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brake_interface`
--
ALTER TABLE `brake_interface`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comm`
--
ALTER TABLE `comm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_monthly`
--
ALTER TABLE `daily_monthly`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `earthing`
--
ALTER TABLE `earthing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fie_info`
--
ALTER TABLE `fie_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locomotive`
--
ALTER TABLE `locomotive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locomotive_avail`
--
ALTER TABLE `locomotive_avail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loco_info`
--
ALTER TABLE `loco_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `ltcas_reports`
--
ALTER TABLE `ltcas_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nms`
--
ALTER TABLE `nms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `power`
--
ALTER TABLE `power`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quarterly_check`
--
ALTER TABLE `quarterly_check`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quarterly_half`
--
ALTER TABLE `quarterly_half`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `riu_monthly_data`
--
ALTER TABLE `riu_monthly_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=349;

--
-- AUTO_INCREMENT for table `roof`
--
ALTER TABLE `roof`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `station_info`
--
ALTER TABLE `station_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `station_reports`
--
ALTER TABLE `station_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `underframe`
--
ALTER TABLE `underframe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `underframe2`
--
ALTER TABLE `underframe2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `brake_interface`
--
ALTER TABLE `brake_interface`
  ADD CONSTRAINT `fk_brake_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `comm`
--
ALTER TABLE `comm`
  ADD CONSTRAINT `comm_ibfk_1` FOREIGN KEY (`riu_info_id`) REFERENCES `riu_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_monthly`
--
ALTER TABLE `daily_monthly`
  ADD CONSTRAINT `daily_monthly_ibfk_1` FOREIGN KEY (`station_info_id`) REFERENCES `station_info` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `locomotive_avail`
--
ALTER TABLE `locomotive_avail`
  ADD CONSTRAINT `fk_loco_avail_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `quarterly_check`
--
ALTER TABLE `quarterly_check`
  ADD CONSTRAINT `quarterly_check_ibfk_1` FOREIGN KEY (`station_info_id`) REFERENCES `station_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quarterly_half`
--
ALTER TABLE `quarterly_half`
  ADD CONSTRAINT `quarterly_half_ibfk_1` FOREIGN KEY (`station_info_id`) REFERENCES `station_info` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `roof`
--
ALTER TABLE `roof`
  ADD CONSTRAINT `fk_roof_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `underframe`
--
ALTER TABLE `underframe`
  ADD CONSTRAINT `fk_underframe_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `underframe2`
--
ALTER TABLE `underframe2`
  ADD CONSTRAINT `fk_underframe2_loco` FOREIGN KEY (`loco`) REFERENCES `loco_info` (`loco`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
