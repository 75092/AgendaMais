<?php
header('Content-Type: application/json');

$ficheiro = 'noticias.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $acao = $dados['acao'] ?? '';

    if (file_exists($ficheiro)) {
        $noticias = json_decode(file_get_contents($ficheiro), true);
    } else {
        $noticias = [];
    }

    if ($acao === 'adicionar') {
        $noticias[] = [
            'titulo' => $dados['titulo'],
            'conteudo' => $dados['conteudo']
        ];
    } elseif ($acao === 'remover') {
        $index = $dados['index'];
        if (isset($noticias[$index])) {
            array_splice($noticias, $index, 1);
        }
    }

    file_put_contents($ficheiro, json_encode($noticias, JSON_PRETTY_PRINT));
    echo json_encode($noticias);
} else {
    if (file_exists($ficheiro)) {
        echo file_get_contents($ficheiro);
    } else {
        echo '[]';
    }
}
?>
