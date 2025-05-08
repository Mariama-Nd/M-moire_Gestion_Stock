<?php

class DB
{
    protected $db;

    public function __construct()
    {
        $host='o86fy.myd.infomaniak.com';
        $user = 'o86fy_khady';         
        $password = 'Passer1234';         
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