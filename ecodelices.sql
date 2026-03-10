-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 10 mars 2026 à 18:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecodelices`
--

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_no` varchar(40) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT '',
  `address` varchar(255) NOT NULL,
  `city` varchar(120) NOT NULL,
  `postal` varchar(30) NOT NULL,
  `note` text DEFAULT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `order_no`, `created_at`, `full_name`, `email`, `phone`, `address`, `city`, `postal`, `note`, `total`) VALUES
(1, 'ORD-1771691588483', '2026-02-21 16:33:08', 'Test Client', 'test@gmail.com', '5140000000', '123 Rue Test', 'Montreal', 'H1H 1H1', '', 24.47),
(2, 'ORD-1771699456146', '2026-02-21 18:44:16', 'test test', 'test@test', 'test', 'test', 'test', 'test', '', 32.96),
(3, 'ORD-1773160477244', '2026-03-10 16:34:37', 'test test', 'test@test', '0000000000', '123 Rue test', 'Montréal', 'H2M 1M5', 'livraison de 9-18 h, sonner et laisser devnt la porte', 26.47);

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `qty` int(11) NOT NULL,
  `line_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `qty`, `line_total`) VALUES
(1, 1, 1, 'Confiture Fraise', 7.99, 2, 15.98),
(2, 1, 2, 'Confiture Framboise', 8.49, 1, 8.49),
(3, 2, 1, 'Confiture Fraise', 7.99, 2, 15.98),
(4, 2, 2, 'Confiture Framboise', 8.49, 2, 16.98),
(5, 3, 1, 'Confiture fraise', 9.49, 1, 9.49),
(6, 3, 2, 'Confiture Framboise', 8.49, 2, 16.98);

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `size` varchar(50) DEFAULT '',
  `category` varchar(80) DEFAULT '',
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `size`, `category`, `description`, `image`, `created_at`) VALUES
(1, 'Confiture fraise', 9.49, '250g', 'Classiques', 'Nouvelle description', 'fraise.jpg', '2026-02-21 14:46:55'),
(2, 'Confiture Framboise', 8.49, '250g', 'Classiques', 'Intense, parfaite pour desserts.', 'framboise.jpg', '2026-02-21 14:46:55'),
(3, 'Confiture Abricot', 8.29, '250g', 'Classiques', 'Parfum délicat, texture fondante.', 'abricot.jpg', '2026-02-21 14:46:55'),
(4, 'Confiture Figue', 8.99, '250g', 'Signature', 'Douce et raffinée.', 'figue.jpg', '2026-02-21 14:46:55');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_no` (`order_no`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
