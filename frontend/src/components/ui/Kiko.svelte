<script lang="ts">
  import { t } from '../../i18n';
  import senang from '../../assets/kiko/kiko-senang.svg?url';
  import semangat from '../../assets/kiko/kiko-semangat.svg?url';
  import kaget from '../../assets/kiko/kiko-kaget.svg?url';
  import tidur from '../../assets/kiko/kiko-tidur.svg?url';

  const urls = { senang, semangat, kaget, tidur };
  type Mood = keyof typeof urls;
  let { mood = 'senang', size = 120 }: { mood?: Mood; size?: number } = $props();
</script>

<img src={urls[mood]} width={size} alt={t(`kiko.${mood}`)} />
