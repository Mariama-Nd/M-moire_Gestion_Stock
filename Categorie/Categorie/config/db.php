<?php

class DB
{
    protected $db;

    public function __construct()
    {
        $host='localhost';
        $user = 'root';         
        $password = '';         
        $dbname = 'o86fy_cmjlf';       

        try {
            $this->db = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
          
        } catch (PDOException $e) {
            echo "Erreur connexion a la base : " . $e->getMessage();
            die();
        }
    }

    public function connect()
    {
        return $this->db;
    }
}