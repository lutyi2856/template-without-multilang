# Set menu_order: Kan Stanislav = 0, others by experience (desc)
# Usage: .\scripts\set-doctors-menu-order.ps1

param([string]$ContainerName = "wp-new-wordpress")

$doctors = @(
    @{ postId = 807; slug = "kan-stanislav-aleksandrovich"; exp = 19 },
    @{ postId = 811; slug = "kan-anna-aleksandrovna"; exp = 13 },
    @{ postId = 814; slug = "kim-dmitrij-moiseevich"; exp = 19 },
    @{ postId = 819; slug = "yugaj-elena-igorevna"; exp = 20 },
    @{ postId = 823; slug = "tulegenova-asel-turahanovna"; exp = 13 },
    @{ postId = 827; slug = "pak-olga-veniaminovna"; exp = 18 },
    @{ postId = 831; slug = "kim-ekaterina-aleksandrovna"; exp = 6 },
    @{ postId = 835; slug = "askarov-mansur-anvarovich"; exp = 10 },
    @{ postId = 837; slug = "tulkunov-ojbek-ahmadzhanovich"; exp = 7 },
    @{ postId = 843; slug = "kim-vitalij-eduardovich"; exp = 7 },
    @{ postId = 847; slug = "kim-anastasiya-radikovna"; exp = 6 },
    @{ postId = 851; slug = "shahzod-shorahmatovich"; exp = 6 },
    @{ postId = 855; slug = "abed-zuhra-zhalalovna"; exp = 4 },
    @{ postId = 857; slug = "abdalieva-uldaulet-parahatovna"; exp = 0 },
    @{ postId = 859; slug = "abdalieva-uldaulet-parahatovna-2"; exp = 0 }
)

$kan = $doctors | Where-Object { $_.postId -eq 807 }
$rest = $doctors | Where-Object { $_.postId -ne 807 } | Sort-Object -Property @{ Expression = { -$_.exp } }, postId
$sorted = @($kan) + @($rest)

$order = 0
foreach ($d in $sorted) {
    Write-Host "Post $($d.postId) $($d.slug) exp=$($d.exp) -> menu_order=$order"
    docker exec $ContainerName wp post update $d.postId --menu_order=$order --allow-root 2>$null
    $order++
}

Write-Host "Done. Kan Stanislav=0, others by experience (desc)" -ForegroundColor Green
