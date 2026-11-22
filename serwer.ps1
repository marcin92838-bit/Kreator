# Prosty serwer plików statycznych do lokalnego uruchamiania aplikacji (folder app/).
# Użycie:  powershell -ExecutionPolicy Bypass -File serwer.ps1   →  http://localhost:8090
param([int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 8090 }))

$root = Join-Path $PSScriptRoot 'app'
$typy = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.ico' = 'image/x-icon'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serwer działa: http://localhost:$Port/  (Ctrl+C kończy)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $sciezka = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($sciezka -eq '') { $sciezka = 'index.html' }
    $plik = [System.IO.Path]::GetFullPath((Join-Path $root $sciezka))
    $res = $ctx.Response
    try {
      if ($plik.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $plik -PathType Leaf)) {
        $bajty = [System.IO.File]::ReadAllBytes($plik)
        $ext = [System.IO.Path]::GetExtension($plik).ToLower()
        $res.ContentType = if ($typy.ContainsKey($ext)) { $typy[$ext] } else { 'application/octet-stream' }
        $res.Headers.Add('Cache-Control', 'no-store')
        $res.ContentLength64 = $bajty.Length
        if ($ctx.Request.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bajty, 0, $bajty.Length) }
      } else {
        $res.StatusCode = 404
      }
    } catch {
      Write-Host "Błąd przy $($ctx.Request.Url): $($_.Exception.Message)"
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
