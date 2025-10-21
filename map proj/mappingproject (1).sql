-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2025 at 12:06 AM
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
-- Database: `mappingproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `locationtagging`
--

CREATE TABLE `locationtagging` (
  `id` int(11) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `category` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locationtagging`
--

INSERT INTO `locationtagging` (`id`, `latitude`, `longitude`, `category`, `name`, `description`) VALUES
(3, 10.673707, 122.944044, 'EV', 'SM City Bacolod', 'Rizal Street, Reclamation Area, Bacolod City, Sm C'),
(4, 10.677071, 122.953303, 'EV', 'ACMobility EV Charging Hub - SEDA Capitol Bacolod', 'Lacson Street,, Gf, Barangay 4 (Pob.), Bacolod Cit'),
(5, 10.683892, 122.957740, 'EV', 'SMI - RIVERSIDE', 'Beside Riverside ChapelSan Agustin Drive, Gf Kaffe'),
(6, 10.656943, 122.952070, 'EV', 'SMI - TACULING', 'Corazon Aquino Dr., Gf Kaffe Sadtu, Taculing, Baco'),
(7, 10.598346, 122.918032, 'Gas', 'Seaoil - Sum Ag', 'Bacolod, Negros Occidental'),
(8, 10.600987, 122.919105, 'Gas', 'Petron Sum-ag', 'JW29+CJQ, Negros South Road, Bacolod, Negros Occid'),
(9, 10.598167, 122.917297, 'Gas', 'Phoenix Station - Bright Quantum', 'National Road, Southside Subdivision Brgy, Bacolod'),
(10, 10.607499, 122.922608, 'Gas', 'Petron Sum-ag', 'JW5F+334, Araneta Ave, Bacolod, Negros Occidental'),
(11, 10.617576, 122.928783, 'Gas', 'Shell - Manville', 'Araneta Avenue Copenhagen, Cor Brgy Tan, 6100 Negr'),
(13, 10.632207, 122.928697, 'Gas', 'Seaoil Tangub', 'Araneta Ave, Bacolod, 6100 Negros Occidental'),
(14, 10.639351, 122.931958, 'Gas', 'Petron - Tangub', 'JWQJ+QQ7, Bacolod, Negros Occidental'),
(15, 10.642914, 122.932956, 'Gas', 'SEAOIL', 'JWVM+558, Bacolod, 6100 Negros Occidental'),
(16, 10.645319, 122.938900, 'Gas', 'Total Alijis', 'Alijis Rd, Bacolod, 6100 Negros Occidental'),
(17, 10.636857, 122.954435, 'Gas', 'Petron Alijis', 'JXP3+QQ7, Alijis Rd, Bacolod, 6100 Negros Occident'),
(18, 10.638528, 122.951995, 'Gas', 'Shell - Alijis', 'Alijis Road, Murcia Road, Brgy, Bacolod, 6100'),
(19, 10.672484, 122.948685, 'Gas', 'Caltex - 888', 'Cor. 9 Burgos Ave, Bacolod, 6100 Negros Occidental'),
(20, 10.672195, 122.948513, 'Gas', 'Flying V Gatuslao', '1 Burgos Ave, Bacolod, 6100 Negros Occidental'),
(21, 10.671757, 122.948706, 'Gas', 'Total Gatuslao', '11 Gatuslao St, Bacolod, 6100 Negros Occidental'),
(22, 10.671594, 122.949693, 'Gas', 'Petron - Locsin', 'MWCX+MVC, Corner of Locsin St. & Burgos Ave., Brgy'),
(23, 10.669179, 122.948604, 'Gas', 'Petron - Jose Rizal St.', 'MW9X+PC4, Locsin St, Bacolod, 6100 Negros Occident'),
(24, 10.668663, 122.950192, 'Gas', 'Caltex Lacson - Rizal', 'MX92+F38, Rizal St.cor, Lacson St, Bacolod, 6100 N'),
(25, 10.674692, 122.948352, 'Gas', 'Ecooil San Juan', 'MWFX+W82, San Juan St, Bacolod, 6100 Negros Occide'),
(26, 10.680534, 122.954757, 'Gas', 'Petron Lacson Capitol', 'MXJ3+7VF, 16th St, Bacolod, 6100 Negros Occidental'),
(27, 10.681409, 122.954924, 'Gas', 'Shell Lacson Capitol', '18 Lacson St, Bacolod, 6100 Negros Occidental'),
(28, 10.683834, 122.955911, 'Gas', 'Caltex Ramos', 'MXM4+GCC, Lacson St, Bacolod, Negros Occidental'),
(29, 10.685247, 122.957032, 'Gas', 'Petron Ramos', 'MXP4+4R7, Lacson St, Bacolod, Negros Occidental'),
(30, 10.677303, 122.960460, 'Gas', 'Shell - BS Aquino Dr,', '100 BS Aquino Dr, Bacolod, 6100 Negros Occidental'),
(31, 10.669923, 122.954870, 'Gas', 'Caltex - Burgos', 'MX93+XW2, Bacolod, 6100 Negros Occidental'),
(32, 10.661219, 122.942044, 'Gas', 'Caltex Lizares', 'MW6R+GRQ, Araneta Ave, Bacolod, 6100 Negros Occide'),
(33, 10.661098, 122.942516, 'Gas', 'Petron Lizares', 'MW6R+FX2, Araneta Ave, Bacolod, 6100 Negros Occide'),
(34, 10.661920, 122.942290, 'Gas', 'Shell - Lizares', 'Rodriguez Avenue, Araneta Ave, Bacolod, 6100 Negro'),
(36, 10.653945, 122.938878, 'Gas', 'Eco Oil Magsaysay', 'Myers Corp, Araneta Ave, Bacolod, 6100 Negros Occi'),
(37, 10.654224, 122.938272, 'Gas', 'Shell - Magsaysay', 'Magsaysay Ave, Singcang, Bacolod, 6100 Negros Occi'),
(38, 10.655178, 122.936378, 'Gas', 'Total - Magsaysay', 'Magsaysay Ave, Singcang, Bacolod, 6100 Negros Occi'),
(39, 10.666233, 122.957803, 'Gas', 'Petron - Lopez Jaena', 'MX85+G44, Lopez Jaena St, Bacolod, 6100 Negros Occ'),
(40, 10.657519, 122.944924, 'Gas', 'SEAOIL - Roxas Lacson', 'Corner Roxas, Lacson St, Barangay 40, Bacolod, 610'),
(41, 10.655800, 122.966900, 'Gas', 'Petron Buri Road', 'Buri Road, Villamonte, Bacolod City'),
(42, 10.720100, 123.001500, 'Gas', 'Shell Airport Access Road', 'Bacolod-Silay Airport Access Road, Talisay'),
(43, 10.695300, 122.985000, 'Gas', 'Caltex Circumferential', 'Circumferential Road, Bacolod'),
(44, 10.609500, 122.951100, 'Gas', 'Phoenix - Panaad', 'Lacson-Magsaysay Ave, near Panaad Stadium'),
(45, 10.627700, 122.972300, 'Gas', 'Seaoil Mansilingan', 'Mansilingan Road, Bacolod City'),
(46, 10.686500, 122.975200, 'Gas', 'Unioil - Circumferential', 'Circumferential Road, Bacolod'),
(47, 10.650800, 122.936000, 'Gas', 'PTT - Magsaysay/Araneta', 'Araneta Ave, Singcang-Airport'),
(48, 10.697500, 122.969100, 'Gas', 'Total - NGC', 'Boxed Site, Bacolod City'),
(49, 10.701100, 122.973000, 'Gas', 'Petron - North Drive', 'Lacson Extension, Bacolod'),
(50, 10.665100, 122.964800, 'Gas', 'Caltex - Mandalagan', 'Lacson St, Mandalagan, Bacolod'),
(51, 10.690500, 122.970500, 'Gas', 'Shell - North Drive Extension', 'North Drive Extension, Bacolod City'),
(52, 10.658800, 122.951500, 'Gas', 'Total - Circumferential', 'Circumferential Road near SM'),
(53, 10.615200, 122.930100, 'Gas', 'Seaoil - Pahanocoy', 'Pahanocoy National Highway'),
(54, 10.679200, 122.953500, 'Gas', 'Petron - 12th Street', '12th St, Capitol Shopping Center'),
(55, 10.688300, 122.960200, 'Gas', 'Phoenix - Bata', 'National Highway, Bata'),
(56, 10.640500, 122.945000, 'Gas', 'UniOil - Alijis Road', 'Alijis Road, near intersection'),
(57, 10.650000, 122.957100, 'Gas', 'Cleanfuel - Singcang', 'Araneta Ave, Singcang-Airport'),
(58, 10.662000, 122.958500, 'Gas', 'Jetti - Capitol Lagoon', 'Gatuslao St, near Capitol'),
(59, 10.625000, 122.961000, 'Gas', 'Total - Murcia Rd', 'Murcia Road, Bacolod'),
(60, 10.684500, 122.946000, 'Gas', 'Shell - Reclamation Area', 'Reclamation Area, Bacolod City'),
(61, 10.630500, 122.940500, 'Gas', 'Seaoil - Sum-ag Exit', 'Sum-ag exit road'),
(62, 10.659000, 122.968000, 'Gas', 'Petron - Villamonte', 'Buri Road, Villamonte'),
(63, 10.675000, 122.955000, 'Gas', 'Caltex - Burgos Extension', 'Burgos St, Extension Area'),
(64, 10.681000, 122.960000, 'Gas', 'Phoenix - Mandalagan', 'Lacson St, Mandalagan'),
(65, 10.648000, 122.930000, 'Gas', 'UniOil - Tangub', 'Araneta Ave, Tangub'),
(66, 10.693000, 122.965000, 'Gas', 'Cleanfuel - Mansilingan', 'Mansilingan Road'),
(67, 10.669000, 122.960000, 'Gas', 'Jetti - Gatuslao', 'Gatuslao St, Central Bacolod'),
(68, 10.628000, 122.955000, 'Gas', 'Total - Alijis Rd 2', 'Alijis Road, South end'),
(69, 10.686000, 122.950000, 'Gas', 'Shell - North Capitol', 'North Capitol Road'),
(70, 10.645000, 122.940000, 'Gas', 'Seaoil - Pahanocoy Bypass', 'Pahanocoy Bypass Road'),
(71, 10.677500, 122.962500, 'Gas', 'Petron - B.S. Aquino', 'B.S. Aquino Drive'),
(72, 10.663000, 122.949000, 'Gas', 'Caltex - Locsin St', 'Locsin St, Downtown Bacolod'),
(73, 10.682000, 122.972000, 'Gas', 'Phoenix - Banago', 'Banago Port Area'),
(74, 10.655500, 122.945500, 'Gas', 'UniOil - Singcang', 'Singcang-Airport Road'),
(75, 10.699000, 122.980000, 'Gas', 'Cleanfuel - Talisay Rd', 'Bacolod-Talisay Road'),
(76, 10.670500, 122.951000, 'Gas', 'Jetti - Rizal St', 'Rizal St, Near Public Plaza'),
(77, 10.635000, 122.965000, 'Gas', 'Total - Magsaysay Ext', 'Magsaysay Ave Extension'),
(78, 10.689000, 122.955000, 'Gas', 'Shell - Lacson North', 'Lacson St, North of City'),
(79, 10.652000, 122.939000, 'Gas', 'Seaoil - Mansilingan Rd', 'Mansilingan Road'),
(80, 10.676500, 122.957500, 'Gas', 'Petron - Burgos St', 'Burgos St, Near Capitol'),
(81, 10.660500, 122.970500, 'Gas', 'Caltex - Buri Ext', 'Buri Road Extension'),
(82, 10.691500, 122.978000, 'Gas', 'Phoenix - Circumferential N', 'Circumferential Road North'),
(83, 10.647000, 122.942000, 'Gas', 'UniOil - Alijis Rd 3', 'Alijis Road, Central section'),
(84, 10.653000, 122.960500, 'Gas', 'Cleanfuel - Airport Rd', 'Singcang-Airport Road'),
(85, 10.680000, 122.945000, 'Gas', 'Jetti - North Reclamation', 'North Reclamation Area'),
(86, 10.638000, 122.958000, 'Gas', 'Total - Alijis East', 'East side of Alijis Road'),
(87, 10.685000, 122.965000, 'Gas', 'Shell - Bata Highway', 'National Highway, Bata Area'),
(88, 10.651500, 122.935000, 'Gas', 'Seaoil - Magsaysay Bypass', 'Magsaysay Ave Bypass'),
(89, 10.674000, 122.963000, 'Gas', 'Petron - Mandalagan Ext', 'Mandalagan Extension'),
(90, 10.665500, 122.951000, 'Gas', 'Caltex - Lacson South', 'Lacson St, South End'),
(91, 10.692000, 122.985000, 'Gas', 'Phoenix - Airport Rd', 'Airport Access Road, Talisay'),
(92, 10.641000, 122.947000, 'Gas', 'UniOil - Alijis West', 'West side of Alijis Road'),
(93, 10.656000, 122.962000, 'Gas', 'Cleanfuel - Villamonte Rd', 'Villamonte Road'),
(94, 10.678000, 122.951000, 'Gas', 'Jetti - North Public Plaza', 'North of Public Plaza'),
(95, 10.632000, 122.950000, 'Gas', 'Total - Tangub East', 'East side of Tangub'),
(96, 10.687000, 122.958000, 'Gas', 'Shell - Ramos Extension', 'Ramos St Extension'),
(97, 10.658000, 122.947000, 'Gas', 'Seaoil - Magsaysay Corner', 'Magsaysay Ave Corner'),
(98, 10.675500, 122.946000, 'Gas', 'Petron - Gatuslao North', 'Gatuslao St, North End'),
(99, 10.661500, 122.955000, 'Gas', 'Caltex - Capitol Center', 'Capitol Shopping Area'),
(100, 10.678800, 122.952000, 'EV', 'AYALA Malls Capitol Central', 'Beside the mall entrance, Bacolod City'),
(101, 10.686000, 122.972000, 'EV', 'Bata Terminal EV Station', 'Along National Highway, Bata'),
(102, 10.691200, 122.968000, 'EV', 'Robinsons Place Bacolod', 'Upper Ground Floor Parking, Mandalagan'),
(103, 10.675000, 122.950000, 'EV', 'EV Hub - Public Plaza Area', 'Near Public Plaza, Accessible 24/7'),
(104, 10.660000, 122.965000, 'EV', 'Villamonte Commercial Complex', 'Inside the commercial center parking'),
(105, 10.642000, 122.950000, 'EV', 'Alijis EV Point', 'Near Alijis Road intersection'),
(106, 10.625500, 122.935000, 'EV', 'Sum-ag Eco Station', 'Near Sum-ag Exit Road'),
(107, 10.668000, 122.947000, 'EV', 'Gatuslao Street Parking Hub', 'Downtown Bacolod, Multi-level parking'),
(108, 10.695000, 122.980500, 'EV', 'Circumferential Road North EV', 'Near NGC, Accessible from highway'),
(109, 10.688000, 122.959000, 'EV', '888 Chinatown Square EV Hub', 'Ground floor parking, near food court'),
(110, 10.665000, 122.956000, 'EV', 'City Hall Government Center', 'Public charging lot, accessible weekdays'),
(111, 10.655000, 122.940000, 'EV', 'Goldenfield Commercial Center', 'South Wing Parking Area'),
(112, 10.640000, 122.935000, 'EV', 'Mandala Residential EV Spot', 'Residential area charging point'),
(113, 10.680000, 122.970000, 'EV', 'New Government Center (NGC) Parking', 'North side public parking'),
(114, 10.671000, 122.949000, 'EV', 'Gaisano City EV Fast Charge', 'Main entrance parking lot'),
(115, 10.662000, 122.960000, 'EV', 'Lopues East Centre EV Station', 'Basement parking'),
(116, 10.679500, 122.955500, 'EV', 'The Upper East EV Center', 'Near Megaworld development site'),
(117, 10.645000, 122.965000, 'EV', 'Mansilingan EV Community Charger', 'Near major intersection in Mansilingan'),
(118, 10.697000, 122.960000, 'EV', 'North Point Retail Center', 'Outside retail strip, accessible 24/7'),
(119, 10.725100, 123.000000, 'EV', 'Airport Access Rd Eco Hub', 'Public charging station along Bacolod-Silay Access Road'),
(120, 10.670300, 122.940500, 'EV', 'Hotel EV Quick Charge', 'Charging available in the hotel parking, Reclamation Area'),
(121, 10.685300, 122.965500, 'EV', 'University EV Charging Point', 'Near USLS campus, accessible from Lacson Street'),
(122, 10.620500, 122.955000, 'EV', 'Circumferential South DC Charger', 'Fast charging point along the southern circumferential road'),
(123, 10.700000, 122.975000, 'EV', 'Talisay Border Gate Charger', 'Charging station near the Bacolod-Talisay boundary'),
(124, 10.675500, 122.960500, 'EV', 'Capitol Park & Lagoon EV', 'Public access charging near the Provincial Capitol park'),
(125, 10.655800, 122.945000, 'EV', 'Libertad Market Area EV', 'Charging lot near the Libertad public market area'),
(126, 10.640200, 122.930500, 'EV', 'Araneta Ave Fast Charge', 'High-speed EV charging along Araneta Avenue'),
(127, 10.665800, 122.952500, 'EV', 'Hospital Parking EV Slot', 'Dedicated EV charging slots at a private hospital parking'),
(128, 10.695500, 122.972000, 'EV', 'Mandalagan North Quick Stop', 'EV charging along Lacson St extension, North of Mandalagan'),
(129, 10.705000, 122.995000, 'Gas', 'Shell - Silay Road', 'Silay Road, Bacolod-Silay boundary'),
(130, 10.598500, 122.920000, 'Gas', 'Caltex - Sum-ag South', 'Sum-ag South Road'),
(131, 10.615000, 122.925000, 'Gas', 'Total - Copenhagen', 'Copenhagen Street, Bacolod'),
(132, 10.622000, 122.935000, 'Gas', 'Petron - Handumanan', 'Handumanan Road'),
(133, 10.638000, 122.928000, 'Gas', 'Phoenix - Tangub South', 'Tangub South Area'),
(134, 10.650000, 122.932000, 'Gas', 'Seaoil - Vista Alegre', 'Vista Alegre, Bacolod'),
(135, 10.668000, 122.943000, 'Gas', 'UniOil - Downtown', 'Downtown Bacolod Area'),
(136, 10.673000, 122.958000, 'Gas', 'Cleanfuel - Capitol Area', 'Near Capitol Complex'),
(137, 10.680000, 122.962000, 'Gas', 'Jetti - Lacson Extension', 'Lacson Street Extension'),
(138, 10.692000, 122.968000, 'Gas', 'Total - Mandalagan North', 'North Mandalagan Road'),
(139, 10.708000, 122.980000, 'Gas', 'Shell - Talisay Border', 'Talisay City Border'),
(140, 10.595000, 122.915000, 'Gas', 'Petron - Tangub Exit', 'Tangub Exit Road'),
(141, 10.605000, 122.928000, 'Gas', 'Caltex - Pahanocoy South', 'Pahanocoy South Road'),
(142, 10.618000, 122.932000, 'Gas', 'Phoenix - Manville South', 'Manville South Area'),
(143, 10.628500, 122.938000, 'Gas', 'Seaoil - Granada', 'Granada Subdivision'),
(144, 10.635500, 122.948000, 'Gas', 'UniOil - Alijis Central', 'Central Alijis Road'),
(145, 10.648500, 122.955000, 'Gas', 'Cleanfuel - Singcang East', 'East Singcang Area'),
(146, 10.658000, 122.960000, 'Gas', 'Jetti - Buri Road', 'Buri Road, Villamonte'),
(147, 10.672000, 122.965000, 'Gas', 'Total - Mandalagan East', 'East Mandalagan'),
(148, 10.685000, 122.972000, 'Gas', 'Shell - Banago West', 'West Banago Area'),
(149, 10.698000, 122.978000, 'Gas', 'Petron - Circumferential West', 'West Circumferential Road'),
(150, 10.710000, 122.990000, 'Gas', 'Caltex - Airport Access', 'Airport Access Road'),
(151, 10.600000, 122.922000, 'Gas', 'Phoenix - Sum-ag North', 'Sum-ag North Road'),
(152, 10.612000, 122.930000, 'Gas', 'Seaoil - Villamonte South', 'South Villamonte'),
(153, 10.625000, 122.940000, 'Gas', 'UniOil - Tangub West', 'West Tangub Area'),
(154, 10.642000, 122.952000, 'Gas', 'Cleanfuel - Alijis North', 'North Alijis Road'),
(155, 10.655000, 122.958000, 'Gas', 'Jetti - Airport Road', 'Airport Road, Singcang'),
(156, 10.665000, 122.963000, 'Gas', 'Total - Mandalagan West', 'West Mandalagan'),
(157, 10.678000, 122.968000, 'Gas', 'Shell - Bata South', 'South Bata Area'),
(158, 10.690000, 122.975000, 'Gas', 'Petron - NGC North', 'North of NGC'),
(159, 10.702000, 122.985000, 'Gas', 'Caltex - Talisay Highway', 'Talisay Highway'),
(160, 10.715000, 122.998000, 'Gas', 'Phoenix - Silay Airport', 'Near Silay Airport'),
(161, 10.602000, 122.924000, 'Gas', 'Seaoil - Copenhagen North', 'North Copenhagen'),
(162, 10.620000, 122.933000, 'Gas', 'UniOil - Handumanan West', 'West Handumanan'),
(163, 10.632000, 122.945000, 'Gas', 'Cleanfuel - Tangub East', 'East Tangub'),
(164, 10.645000, 122.958000, 'Gas', 'Jetti - Murcia Road', 'Murcia Road'),
(165, 10.660000, 122.966000, 'Gas', 'Total - Villamonte North', 'North Villamonte'),
(166, 10.675000, 122.970000, 'Gas', 'Shell - Mandalagan Center', 'Central Mandalagan'),
(167, 10.688000, 122.978000, 'Gas', 'Petron - Banago North', 'North Banago'),
(168, 10.700000, 122.988000, 'Gas', 'Caltex - Talisay South', 'South Talisay'),
(169, 10.608000, 122.926000, 'Gas', 'Phoenix - Araneta South', 'South Araneta Ave'),
(170, 10.625000, 122.942000, 'Gas', 'Seaoil - Granada West', 'West Granada'),
(171, 10.710000, 122.982000, 'EV', 'Silay City Plaza EV Hub', 'Silay City Public Plaza area'),
(172, 10.600000, 122.923000, 'EV', 'Sum-ag Commercial EV Point', 'Sum-ag commercial district'),
(173, 10.618000, 122.933000, 'EV', 'Manville Heights EV Charger', 'Manville residential area'),
(174, 10.635000, 122.946000, 'EV', 'Granada Mall EV Station', 'Granada Shopping Center parking'),
(175, 10.652000, 122.958000, 'EV', 'Singcang Terminal EV Hub', 'Singcang Jeepney Terminal area'),
(176, 10.663000, 122.964000, 'EV', 'Buri Commercial Strip EV', 'Buri Road commercial area'),
(177, 10.672000, 122.966000, 'EV', 'Mandalagan Plaza EV Point', 'Mandalagan public plaza'),
(178, 10.683000, 122.973000, 'EV', 'Banago Port EV Fast Charge', 'Banago Port area, fast charging'),
(179, 10.694000, 122.981000, 'EV', 'Talisay Gateway EV Hub', 'Talisay City Gateway'),
(180, 10.705000, 122.992000, 'EV', 'Airport Village EV Station', 'Airport Village residential'),
(181, 10.615000, 122.928000, 'EV', 'Pahanocoy Community EV', 'Pahanocoy community center'),
(182, 10.628000, 122.937000, 'EV', 'Tangub Public Market EV', 'Near Tangub Public Market'),
(183, 10.643000, 122.948000, 'EV', 'Alijis Junction EV Point', 'Major Alijis Road junction'),
(184, 10.657000, 122.959000, 'EV', 'Singcang-Airport EV Express', 'Express charging, Singcang-Airport Road'),
(185, 10.667000, 122.965000, 'EV', 'Villamonte District EV Hub', 'Central Villamonte district'),
(186, 10.676000, 122.969000, 'EV', 'Lacson North End EV', 'Northern end of Lacson Street'),
(187, 10.687000, 122.976000, 'EV', 'NGC East Wing EV Charger', 'New Government Center East Wing'),
(188, 10.698000, 122.984000, 'EV', 'Circumferential Mall EV', 'Circumferential Road shopping area'),
(189, 10.712000, 122.996000, 'EV', 'Silay Airport Terminal EV', 'Bacolod-Silay Airport Terminal'),
(190, 10.608000, 122.925000, 'EV', 'Sum-ag North Plaza EV', 'Sum-ag North public plaza'),
(191, 10.622000, 122.936000, 'EV', 'Handumanan Heights EV', 'Handumanan residential heights'),
(192, 10.638000, 122.949000, 'EV', 'Tangub Commercial EV Hub', 'Tangub commercial center'),
(193, 10.654000, 122.960000, 'EV', 'Airport Road Express EV', 'Airport Road express charging'),
(194, 10.669000, 122.967000, 'EV', 'Mandalagan West EV Point', 'West Mandalagan area'),
(195, 10.681000, 122.974000, 'EV', 'Banago Commercial EV', 'Banago commercial district'),
(196, 10.693000, 122.982000, 'EV', 'Talisay North District EV', 'North Talisay district'),
(197, 10.706000, 122.993000, 'EV', 'Airport Access Quick Charge', 'Airport Access Road, quick charge'),
(198, 10.718000, 123.002000, 'EV', 'Silay Plaza Mayor EV Hub', 'Silay Plaza Mayor area'),
(199, 10.612000, 122.927000, 'EV', 'Copenhagen Street EV', 'Copenhagen Street area'),
(200, 10.630000, 122.943000, 'EV', 'Granada South EV Charger', 'South Granada subdivision'),
(201, 10.595000, 122.918000, 'Gas', 'Total - Sum-ag West', 'West Sum-ag area'),
(202, 10.603000, 122.921000, 'Gas', 'Shell - Copenhagen South', 'South Copenhagen Street'),
(203, 10.614000, 122.927000, 'Gas', 'Petron - Araneta East', 'East Araneta Avenue'),
(204, 10.626000, 122.934000, 'Gas', 'Caltex - Handumanan South', 'South Handumanan area'),
(205, 10.637000, 122.941000, 'Gas', 'Phoenix - Tangub Center', 'Central Tangub area'),
(206, 10.649000, 122.948000, 'Gas', 'Seaoil - Alijis West', 'West Alijis Road'),
(207, 10.661000, 122.954000, 'Gas', 'UniOil - Capitol South', 'South Capitol area'),
(208, 10.673000, 122.961000, 'Gas', 'Cleanfuel - Mandalagan South', 'South Mandalagan'),
(209, 10.684000, 122.968000, 'Gas', 'Jetti - Bata West', 'West Bata area'),
(210, 10.696000, 122.975000, 'Gas', 'Total - Talisay East', 'East Talisay'),
(211, 10.707000, 122.983000, 'Gas', 'Shell - Airport North', 'North of Airport'),
(212, 10.718000, 122.991000, 'Gas', 'Petron - Silay South', 'South Silay area'),
(213, 10.597000, 122.920000, 'Gas', 'Caltex - Tangub South Exit', 'Tangub South Exit'),
(214, 10.610000, 122.929000, 'Gas', 'Phoenix - Pahanocoy East', 'East Pahanocoy'),
(215, 10.621000, 122.936000, 'Gas', 'Seaoil - Manville East', 'East Manville'),
(216, 10.633000, 122.943000, 'Gas', 'UniOil - Granada North', 'North Granada'),
(217, 10.644000, 122.950000, 'Gas', 'Cleanfuel - Alijis South', 'South Alijis Road'),
(218, 10.656000, 122.957000, 'Gas', 'Jetti - Singcang West', 'West Singcang'),
(219, 10.668000, 122.964000, 'Gas', 'Total - Buri West', 'West Buri Road'),
(220, 10.679000, 122.971000, 'Gas', 'Shell - Banago East', 'East Banago'),
(221, 10.691000, 122.979000, 'Gas', 'Petron - NGC West', 'West of NGC'),
(222, 10.703000, 122.987000, 'Gas', 'Caltex - Talisay West', 'West Talisay'),
(223, 10.714000, 122.995000, 'Gas', 'Phoenix - Airport South', 'South of Airport'),
(224, 10.601000, 122.923000, 'Gas', 'Seaoil - Sum-ag East', 'East Sum-ag'),
(225, 10.616000, 122.931000, 'Gas', 'UniOil - Copenhagen East', 'East Copenhagen'),
(226, 10.629000, 122.939000, 'Gas', 'Cleanfuel - Tangub North', 'North Tangub'),
(227, 10.641000, 122.946000, 'Gas', 'Jetti - Alijis East', 'East Alijis Road'),
(228, 10.653000, 122.953000, 'Gas', 'Total - Singcang North', 'North Singcang'),
(229, 10.666000, 122.961000, 'Gas', 'Shell - Villamonte East', 'East Villamonte'),
(230, 10.677000, 122.968000, 'Gas', 'Petron - Mandalagan West', 'West Mandalagan'),
(231, 10.689000, 122.976000, 'Gas', 'Caltex - Bata East', 'East Bata'),
(232, 10.701000, 122.984000, 'Gas', 'Phoenix - NGC South', 'South of NGC'),
(233, 10.712000, 122.992000, 'Gas', 'Seaoil - Talisay North', 'North Talisay'),
(234, 10.599000, 122.922000, 'Gas', 'UniOil - Sum-ag Center', 'Central Sum-ag'),
(235, 10.613000, 122.930000, 'Gas', 'Cleanfuel - Pahanocoy West', 'West Pahanocoy'),
(236, 10.624000, 122.937000, 'Gas', 'Jetti - Handumanan East', 'East Handumanan'),
(237, 10.636000, 122.944000, 'Gas', 'Total - Tangub West', 'West Tangub'),
(238, 10.752300, 122.978900, 'Gas', 'Phoenix - Silay Highway', 'Located along Silay proper, beside highway transport terminal'),
(239, 10.752800, 122.980500, 'EV', 'Silay City EV Charging Station', 'Public charging hub beside Silay City Plaza'),
(240, 10.591200, 122.975400, 'Gas', 'Jetti - Bago South', 'Southbound road to Bago City proper'),
(241, 10.594500, 122.972100, 'EV', 'Bago Riverside EV Spot', 'Riverside Road, near Bago Coliseum'),
(242, 10.671800, 123.008700, 'Gas', 'Shell - Murcia Entry Point', 'Murcia Municipal Road, entrance to town proper'),
(243, 10.670500, 123.005300, 'EV', 'Murcia Municipal Charging Bay', 'Behind Murcia Public Market'),
(244, 10.658800, 122.935000, 'Gas', 'Unioil - Goldenfields', 'Goldenfields Commercial Complex, Bacolod'),
(245, 10.675600, 122.924700, 'EV', 'Sum-ag QuickCharge', 'Beside Sum-ag National High School'),
(246, 10.663300, 122.916900, 'Gas', 'Seaoil - Punta Taytay Road', 'Near Punta Taytay Access Road, Bacolod'),
(247, 10.710000, 122.964200, 'EV', 'Carmen EV Station', 'Carmen Ville Subdivision, North Bacolod'),
(248, 10.738600, 122.978400, 'Gas', 'Seaoil - Talisay Crossing', 'Located at Talisay City National Highway corner Lopez Jaena Street'),
(249, 10.734800, 122.982100, 'EV', 'Talisay Public Market EV Spot', 'Charging station near Talisay Public Market entrance'),
(250, 10.532100, 123.303300, 'Gas', 'Phoenix - Don Salvador Highway', 'Midway to Don Salvador, on KM 34 marker'),
(251, 10.530200, 123.300100, 'EV', 'DSB RidgeCharge', 'Hilltop charging station with scenic view deck'),
(252, 10.424500, 122.934700, 'Gas', 'Petron - La Carlota Central', 'Beside La Carlota City Hall'),
(253, 10.421300, 122.938200, 'EV', 'La Carlota EV Hub', 'Corner of Burgos Street and Rizal Avenue'),
(254, 10.689100, 122.946800, 'Gas', 'Shell - Vista Alegre', 'Within Vista Alegre residential area, south Bacolod'),
(255, 10.701500, 122.953600, 'EV', 'Handumanan RapidCharge', 'Community charging station in Handumanan barangay hall'),
(256, 10.746700, 122.960900, 'Gas', 'Caltex - Mandalagan North', 'Northern Mandalagan boundary, near flyover exit'),
(257, 10.766400, 122.979000, 'EV', 'Airport Link EV Station', 'Route to Bacolod-Silay Airport, near Bangga Bagacay');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(6, 'rap', 'q', 'admin'),
(7, 'Rappo25', '$2y$10$TIULoitTivW1gb/no54aKe86Rm7la2D.JAmGyCYRpEj', 'user'),
(8, 'opkoni', 'qwertyu', 'user'),
(9, 'akoni', 'opkoni', 'admin'),
(10, 'jets', 'opkoni', 'admin'),
(11, 'jet', 'opkoni', 'user'),
(12, 'tim', 'qazwsx', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `locationtagging`
--
ALTER TABLE `locationtagging`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `locationtagging`
--
ALTER TABLE `locationtagging`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;