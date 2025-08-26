<?php
session_start();

// Verifica se o utilizador tem token válido no header
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    http_response_code(401);
    echo "Não autorizado (sem token).";
    exit;
}

list($type, $token) = explode(" ", $_SERVER['HTTP_AUTHORIZATION'], 2);
if (strcasecmp($type, "Bearer") != 0) {
    http_response_code(401);
    echo "Token inválido.";
    exit;
}

// Decodificar token JWT (precisas de instalar firebase/php-jwt no servidor)
// composer require firebase/php-jwt
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret = "SEGREDO_DO_TOKEN"; // usa a mesma chave que usas no login
try {
    $payload = JWT::decode($token, new Key($secret, 'HS256'));
    if ($payload->role !== "admin") {
        http_response_code(403);
        echo "Apenas administradores podem enviar ficheiros.";
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo "Token inválido.";
    exit;
}

// --- PROCESSAR FORMULÁRIO ---
$nome = $_POST['nome'] ?? '';
$email = $_POST['email'] ?? '';
$mensagem = $_POST['mensagem'] ?? '';

if (isset($_FILES['ficheiro'])) {
    $targetDir = "uploads/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $filename = basename($_FILES["ficheiro"]["name"]);
    $targetFile = $targetDir . time() . "_" . $filename;

    if (move_uploaded_file($_FILES["ficheiro"]["tmp_name"], $targetFile)) {
        echo "✅ Upload feito com sucesso!";
    } else {
        echo "❌ Erro no upload do ficheiro.";
    }
} else {
    echo "Nenhum ficheiro enviado.";
}
?>
