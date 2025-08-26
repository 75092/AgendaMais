<?php
// --- Verificar se existe token no header ---
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

// --- Decodificar token JWT ---
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret = "SEGREDO_DO_TOKEN"; // 🔑 Substituir pela mesma chave usada no login
try {
    $payload = JWT::decode($token, new Key($secret, 'HS256'));
    if ($payload->role !== "admin") {
        http_response_code(403);
        echo "Apenas administradores podem gerir notícias.";
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo "Token inválido.";
    exit;
}

// --- Carregar notícias existentes ---
$file = "noticias.json";
$noticias = [];
if (file_exists($file)) {
    $noticias = json_decode(file_get_contents($file), true);
}

// --- Adicionar notícia ---
if (isset($_POST['titulo']) && isset($_POST['conteudo'])) {
    $titulo = trim($_POST['titulo']);
    $conteudo = trim($_POST['conteudo']);

    if (!$titulo || !$conteudo) {
        echo "❌ Campos obrigatórios em falta.";
        exit;
    }

    $noticias[] = [
        "titulo" => $titulo,
        "conteudo" => $conteudo,
        "data" => date("Y-m-d H:i")
    ];

    file_put_contents($file, json_encode($noticias, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "✅ Notícia adicionada com sucesso!";
    exit;
}

// --- Remover notícia ---
if (isset($_POST['remover'])) {
    $index = intval($_POST['remover']);
    if (isset($noticias[$index])) {
        array_splice($noticias, $index, 1);
        file_put_contents($file, json_encode($noticias, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "🗑️ Notícia removida com sucesso!";
    } else {
        echo "❌ Notícia não encontrada.";
    }
    exit;
}

echo "⚠️ Nenhuma ação válida recebida.";
