param (
    [string]$PdfPath = "RRB Jammu.pdf",
    [string]$ZoneKey = "jammu"
)

if (-not (Test-Path $PdfPath)) {
    Write-Error "PDF file '$PdfPath' not found!"
    exit 1
}

$fullPdfPath = (Resolve-Path $PdfPath).Path

$csharp = @'
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class PdfRollsExtractor {
    public static List<string> Extract(string pdfPath) {
        byte[] bytes = File.ReadAllBytes(pdfPath);
        string text = Encoding.ASCII.GetString(bytes);

        // 1. Parse all CMaps in the PDF
        Dictionary<string, string> glyphMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        MatchCollection cmapMatches = Regex.Matches(text, @"/CIDInit[\s\S]*?endcmap");
        foreach (Match cm in cmapMatches) {
            string c = cm.Value;
            MatchCollection bfchar = Regex.Matches(c, @"<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>");
            foreach (Match m in bfchar) {
                string g = m.Groups[1].Value.PadLeft(4, '0').ToUpper();
                int u = Convert.ToInt32(m.Groups[2].Value, 16);
                glyphMap[g] = ((char)u).ToString();
            }
            MatchCollection bfrange = Regex.Matches(c, @"<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>");
            foreach (Match m in bfrange) {
                int start = Convert.ToInt32(m.Groups[1].Value, 16);
                int end = Convert.ToInt32(m.Groups[2].Value, 16);
                int uStart = Convert.ToInt32(m.Groups[3].Value, 16);
                for (int i = 0; i <= end - start; i++) {
                    string g = (start + i).ToString("X4").ToUpper();
                    glyphMap[g] = ((char)(uStart + i)).ToString();
                }
            }
        }

        // 2. Extract and decompress all Flate streams
        Regex objRegex = new Regex(@"(\d+)\s+(\d+)\s+obj\s*<<([\s\S]*?)>>\s*stream\r?\n", RegexOptions.Compiled);
        MatchCollection matches = objRegex.Matches(text);

        HashSet<string> uniqueRolls = new HashSet<string>();

        foreach (Match m in matches) {
            string dict = m.Groups[3].Value;
            if (dict.Contains("/Filter") && dict.Contains("/FlateDecode") && !dict.Contains("/Length1")) {
                int streamStart = m.Index + m.Length;
                int streamEnd = text.IndexOf("endstream", streamStart);
                if (streamEnd > streamStart) {
                    int len = streamEnd - streamStart;
                    while (len > 0 && (bytes[streamStart + len - 1] == 10 || bytes[streamStart + len - 1] == 13)) {
                        len--;
                    }
                    try {
                        using (MemoryStream ms = new MemoryStream(bytes, streamStart + 2, len - 2))
                        using (DeflateStream ds = new DeflateStream(ms, CompressionMode.Decompress))
                        using (StreamReader reader = new StreamReader(ds, Encoding.UTF8)) {
                            string decomp = reader.ReadToEnd();

                            // Match direct digits
                            MatchCollection directMatches = Regex.Matches(decomp, @"\b\d{14,18}\b");
                            foreach (Match dm in directMatches) {
                                uniqueRolls.Add(dm.Value);
                            }

                            // Match TJ arrays
                            MatchCollection tjMatches = Regex.Matches(decomp, @"\[([^\]]+)\]\s*TJ");
                            foreach (Match tj in tjMatches) {
                                string arr = tj.Groups[1].Value;
                                MatchCollection glyphMatches = Regex.Matches(arr, @"<([0-9a-fA-F]{4})>");
                                StringBuilder sb = new StringBuilder();
                                foreach (Match gm in glyphMatches) {
                                    string g = gm.Groups[1].Value.ToUpper();
                                    if (glyphMap.ContainsKey(g)) {
                                        sb.Append(glyphMap[g]);
                                    } else {
                                        sb.Append("?");
                                    }
                                }
                                string decoded = sb.ToString().Trim();
                                if (Regex.IsMatch(decoded, @"^\d{14,18}$")) {
                                    uniqueRolls.Add(decoded);
                                }
                            }
                        }
                    } catch {}
                }
            }
        }

        List<string> result = new List<string>(uniqueRolls);
        result.Sort();
        return result;
    }
}
'@

Add-Type -TypeDefinition $csharp -Language CSharp
$extractedRolls = [PdfRollsExtractor]::Extract($fullPdfPath)

Write-Host "`n[+] Found $($extractedRolls.Count) roll numbers in $PdfPath" -ForegroundColor Green

if ($extractedRolls.Count -gt 0) {
    $outFile = "$ZoneKey`_rolls.json"
    $json = ConvertTo-Json @($extractedRolls) -Depth 2
    [System.IO.File]::WriteAllText($outFile, $json)
    Write-Host "[+] Saved roll numbers to $outFile" -ForegroundColor Cyan
    Write-Host "[+] Sample Roll Numbers (Total: $($extractedRolls.Count)):"
    $extractedRolls | Select-Object -First 5 | ForEach-Object { Write-Host "    - $_" }
} else {
    Write-Warning "No roll numbers could be extracted. Please check the PDF."
}
