// Sitemap XSL stylesheet — tarayicida XML yerine sik bir tablo gosterir.
// Crawler'lar bunu yok sayar (SEO'ya etkisi yok); sadece insan gorunumu icin.
export const revalidate = 86400;

const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="tr">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>ScoresTV — Sitemap</title>
        <style>
          body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0e1620;color:#e8edf3;margin:0;}
          .wrap{max-width:1040px;margin:0 auto;padding:34px 20px 70px;}
          .head{display:flex;align-items:baseline;gap:14px;border-bottom:1px solid #243140;padding-bottom:16px;}
          .brand{font-size:23px;font-weight:700;letter-spacing:-.01em;}
          .brand b{color:#00F4FC;}
          .count{font-size:12px;color:#9fb0c0;background:#18222e;border:1px solid #243140;border-radius:999px;padding:4px 13px;}
          .sub{color:#9fb0c0;font-size:13px;margin:16px 0 18px;line-height:1.5;}
          .sub a{color:#37a7ff;text-decoration:none;}
          table{width:100%;border-collapse:collapse;font-size:13.5px;}
          th{text-align:left;color:#9fb0c0;font-weight:600;border-bottom:1px solid #243140;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
          td{padding:9px 12px;border-bottom:1px solid #18222e;vertical-align:top;}
          tr:hover td{background:#131b26;}
          a.loc{color:#37a7ff;text-decoration:none;word-break:break-all;}
          a.loc:hover{color:#00F4FC;text-decoration:underline;}
          .num{color:#6b7c8c;width:54px;}
          .meta{color:#9fb0c0;white-space:nowrap;width:1%;}
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="head">
            <span class="brand">Scores<b>TV</b> — Sitemap</span>
            <xsl:if test="s:sitemapindex">
              <span class="count"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemap</span>
            </xsl:if>
            <xsl:if test="s:urlset">
              <span class="count"><xsl:value-of select="count(s:urlset/s:url)"/> URL</span>
            </xsl:if>
          </div>

          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p class="sub">Bu bir sitemap indeksidir — aşağıdaki alt sitemap'leri içerir.</p>
              <table>
                <tr><th class="num">#</th><th>Sitemap</th><th>Son Güncelleme</th></tr>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td class="num"><xsl:value-of select="position()"/></td>
                    <td><a class="loc" href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                    <td class="meta"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <p class="sub">Bu sitemap'teki sayfa adresleri.</p>
              <table>
                <tr><th class="num">#</th><th>URL</th><th>Öncelik</th><th>Sıklık</th><th>Son Güncelleme</th></tr>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="num"><xsl:value-of select="position()"/></td>
                    <td><a class="loc" href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                    <td class="meta"><xsl:value-of select="s:priority"/></td>
                    <td class="meta"><xsl:value-of select="s:changefreq"/></td>
                    <td class="meta"><xsl:value-of select="substring(s:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

export async function GET() {
  return new Response(XSL, {
    headers: {
      "Content-Type": "text/xsl; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
