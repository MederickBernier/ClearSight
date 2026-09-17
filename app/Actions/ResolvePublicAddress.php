<?php

namespace App\Actions;

/**
 * Decides whether a URL the app is about to fetch points at the public
 * internet, and pins the address it resolved to.
 *
 * Feed URLs are typed in by people, and the server fetches them from inside
 * the network it runs in. Without this, a feed could name the cloud metadata
 * endpoint, the database container, or anything else only the server can
 * reach. The resolved address is handed back so the request connects to the
 * address that was checked, not whatever a second DNS lookup returns.
 *
 * ponytail: IPv4 only (gethostbynamel). An IPv6-only feed is refused; add
 * dns_get_record(DNS_AAAA) the day someone needs one.
 */
class ResolvePublicAddress
{
    /**
     * Null when the URL is not http(s), does not resolve, or reaches anything
     * outside the global address range.
     *
     * @return array{host: string, port: int, ip: string}|null
     */
    public function __invoke(string $url): ?array
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = trim($parts['host'] ?? '', '[]');

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return null;
        }

        $addresses = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : $this->lookup($host);

        if ($addresses === []) {
            return null;
        }

        foreach ($addresses as $address) {
            $public = filter_var(
                $address,
                FILTER_VALIDATE_IP,
                // Global range: private and reserved, plus carrier-grade NAT,
                // documentation and benchmarking blocks.
                FILTER_FLAG_GLOBAL_RANGE,
            );

            if ($public === false) {
                return null;
            }
        }

        return [
            'host' => $host,
            'port' => $parts['port'] ?? ($scheme === 'https' ? 443 : 80),
            'ip' => $addresses[0],
        ];
    }

    /**
     * @return list<string>
     */
    protected function lookup(string $host): array
    {
        return gethostbynamel($host) ?: [];
    }
}
