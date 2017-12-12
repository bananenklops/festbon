<?php
/**
*	Author: Tobias Keßler
*   Datum: 09.11.2017
*/

namespace Model\Daten;

// Konstanten Definitionen
define('QUERY_GET', 1);
define('QUERY_SET', 2);

/**
*   Basis-Schnittstelle zur Datenbank (Singleton)
*/
class Datenbank
{
// Eigenschaften
	
	// Private
	private $_DBHost     = 'localhost';
	private $_DBUser     = 'root';
	private $_DBPass     = '';
	private $_DBData     = 'festbon';
	
	private $_DB	     = null;
	
	private static $_DBInstance = null;
	
	// Public
	
// Methoden

	// Private
	
	/**
	*	Privater Konstruktor für Singleton
	*
	*	Erzeugt Datenbank Objekt bzw. Verbindung
	*/
	private function __construct()
	{
		$this->_DB = new \mysqli($this->_DBHost, $this->_DBUser, $this->_DBPass, $this->_DBData);
		
		if ($this->_DB->connect_error) {
			die ('MySQL Verbindungsfehler ('.$this->_DB->connect_errno.') '.$this->_DB->connect_error);
		}
	}
	
	// Public
	
	/**
	*	Gibt das Objekt dieser Singleton Klasse zurück oder erstellt eine neue Instanz, falls noch keine vorhanden ist.
	*
	*	@return Datenbank  
	*/
	public static function getInstance()
	{
		if (self::$_DBInstance === null)
			self::$_DBInstance = new Datenbank();
		
		return self::$_DBInstance;
	}
	
	/**
	*	Führt MySQL Query aus
	*
	*	@param   string $query SQL-Query
	*	@return  array, bool oder string
	*/
	public function executeQuery($query)
	{
		$result = $this->_DB->query($query);
		if ($result === false)
			return '(Nr' . $this->_DB->errno . ') ' . $this->_DB->error;
		else if ($result === true)
			return true;
		
		$res = array();
		while ($row = $result->fetch_assoc()) {
			$res[] = $row;
		}
		return $res;
	}
}
?>