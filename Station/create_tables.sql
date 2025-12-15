-- ============================================
-- Station Maintenance Database Tables
-- Database: maintainance
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS maintainance;
USE maintainance;

-- ============================================
-- Table: station_info
-- Stores basic station information (zone, station, date)
-- ============================================
CREATE TABLE IF NOT EXISTS station_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone VARCHAR(100) NOT NULL,
    station VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_station_date (zone, station, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: quarterly_check
-- Stores Schedule Check – Quarterly module data
-- ============================================
CREATE TABLE IF NOT EXISTS quarterly_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    s_no INT NOT NULL,
    station_info_id INT NOT NULL,
    module VARCHAR(50),
    details VARCHAR(255),
    name_number VARCHAR(255),
    date_commission DATE,
    required_value VARCHAR(255),
    observed_value VARCHAR(255),
    remarks TEXT,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_info_id) REFERENCES station_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_row (station_info_id, s_no, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: daily_monthly
-- Stores Maintenance Schedule – Daily & Monthly module data
-- ============================================
CREATE TABLE IF NOT EXISTS daily_monthly (
    id INT AUTO_INCREMENT PRIMARY KEY,
    s_no INT NOT NULL,
    station_info_id INT NOT NULL,
    module VARCHAR(50),
    location VARCHAR(255),
    maintenance_task_description VARCHAR(255),
    action_taken VARCHAR(255),
    frequency VARCHAR(255),
    equipment_condition VARCHAR(255),
    remarks TEXT,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_info_id) REFERENCES station_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_row (station_info_id, s_no, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================
-- Table: quarterly_half
-- Stores Maintenance Schedule – Quarterly & Half Yearly module data
-- ============================================
CREATE TABLE IF NOT EXISTS quarterly_half (
    id INT AUTO_INCREMENT PRIMARY KEY,
    s_no INT NOT NULL,
    station_info_id INT NOT NULL,
    module VARCHAR(50),
    location VARCHAR(255),
    maintenance_task_description VARCHAR(255),
    action_taken VARCHAR(255),
    frequency VARCHAR(255),
    equipment_condition VARCHAR(255),
    remarks TEXT,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_info_id) REFERENCES station_info(id) ON DELETE CASCADE,
    UNIQUE KEY unique_row (station_info_id, s_no, module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Sample Queries
-- ============================================

-- View all station info
-- SELECT * FROM station_info ORDER BY created_at DESC;

-- View quarterly check data for a specific station
-- SELECT q.*, s.zone, s.station, s.date
-- FROM quarterly_check q
-- JOIN station_info s ON q.station_info_id = s.id
-- WHERE s.zone = 'Zone1' AND s.station = 'Station1' AND s.date = '2024-01-01';

-- View all module data for a station
-- SELECT 'quarterly_check' as module_type, COUNT(*) as row_count FROM quarterly_check WHERE station_info_id = 1
-- UNION ALL
-- SELECT 'daily_monthly', COUNT(*) FROM daily_monthly WHERE station_info_id = 1
-- UNION ALL
-- SELECT 'quarterly_half', COUNT(*) FROM quarterly_half WHERE station_info_id = 1;

