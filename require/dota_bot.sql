-- phpMyAdmin SQL Dump
-- version 4.0.10.6
-- http://www.phpmyadmin.net
--
-- Хост: 127.0.0.1:3306
-- Время создания: Фев 14 2016 г., 16:07
-- Версия сервера: 5.5.41-log
-- Версия PHP: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `dota`
--

-- --------------------------------------------------------

--
-- Структура таблицы `ladder_bots`
--

CREATE TABLE IF NOT EXISTS `ladder_bots` (
  `bot_id` int(11) NOT NULL AUTO_INCREMENT,
  `bot_busy` int(11) NOT NULL,
  `bot_game` int(11) NOT NULL,
  `bot_gameid` int(11) NOT NULL,
  PRIMARY KEY (`bot_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Дамп данных таблицы `ladder_bots`
--

INSERT INTO `ladder_bots` (`bot_id`, `bot_busy`, `bot_game`, `bot_gameid`) VALUES
(1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `ladder_lobbies`
--

CREATE TABLE IF NOT EXISTS `ladder_lobbies` (
  `lobby_id` int(11) NOT NULL AUTO_INCREMENT,
  `lobby_status` int(11) NOT NULL,
  `lobby_date` datetime NOT NULL,
  `lobby_finishdate` datetime NOT NULL,
  `lobby_gm` int(11) NOT NULL,
  PRIMARY KEY (`lobby_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `ladder_lobbies_games`
--

CREATE TABLE IF NOT EXISTS `ladder_lobbies_games` (
  `lobby_g_id` int(11) NOT NULL AUTO_INCREMENT,
  `lobby_g_lobby` int(11) NOT NULL,
  `lobby_g_team1` varchar(11) NOT NULL,
  `lobby_g_players1` varchar(192) NOT NULL,
  `lobby_g_team2` varchar(11) NOT NULL,
  `lobby_g_players2` varchar(192) NOT NULL,
  `lobby_g_num` int(11) NOT NULL,
  `lobby_g_status` int(11) NOT NULL,
  `lobby_g_result` varchar(11) NOT NULL,
  `lobby_g_winner` int(11) NOT NULL,
  `lobby_g_gamemode` int(11) NOT NULL,
  PRIMARY KEY (`lobby_g_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
