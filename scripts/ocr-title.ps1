# 이미지마다 Windows 기본 OCR(한국어)로 읽은 글자를 한 줄씩 내보낸다.
# praise-conti-latest.py 가 곡 제목 후보를 만들 때 부른다. 못 읽으면 빈 줄.
# WinRT 형식을 쓰므로 PowerShell 7(pwsh)이 아니라 Windows PowerShell 5.1(powershell.exe)로 실행해야 한다.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Images)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]
function Await($op, $type) {
    $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
    $task.Wait() | Out-Null
    $task.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("ko"))
foreach ($image in $Images) {
    $text = ""
    if ($engine) {
        try {
            $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($image)) ([Windows.Storage.StorageFile])
            $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
            $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
            $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
            $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
            if ($result.Lines.Count -gt 0) { $text = $result.Lines[0].Text }
            $stream.Dispose()
        } catch { $text = "" }
    }
    Write-Output $text
}
