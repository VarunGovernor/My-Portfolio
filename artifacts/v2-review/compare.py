"""Compare actual Chromium frames with the supplied references (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageStat
import json, sys

folder = Path(__file__).parent
root = folder.parents[1]
label = sys.argv[1] if len(sys.argv) > 1 else 'final'
metrics = {}
for scene, reference in [('hero', 'hero-target.png'), ('work-about', 'work-about-target.png')]:
    target = Image.open(root / 'design/v2-reference' / reference).convert('RGB')
    actual = Image.open(folder / f'{label}-{scene}.png').convert('RGB')
    assert target.size == actual.size == (1672, 941)
    Image.blend(target, actual, .5).save(folder / f'{label}-{scene}-overlay.png')
    difference = ImageChops.difference(target, actual)
    ImageEnhance.Contrast(difference).enhance(2).save(folder / f'{label}-{scene}-diff.png')
    pair = Image.new('RGB', (3344, 941))
    pair.paste(target); pair.paste(actual, (1672, 0))
    pair.resize((1672, 470)).save(folder / f'{label}-{scene}-comparison.png')
    metrics[scene] = {'mean_absolute_rgb_error': round(sum(ImageStat.Stat(difference).mean) / 3, 2)}
(folder / f'{label}-comparison.json').write_text(json.dumps(metrics, indent=2))
print(json.dumps(metrics))
if label == 'final':
    motion = {}
    for first, second in [('motion-t0', 'motion-t5'), ('motion-pointer', 'motion-leave')]:
        difference = ImageChops.difference(
            Image.open(folder / f'{first}.png').convert('RGB'),
            Image.open(folder / f'{second}.png').convert('RGB'),
        ).crop((1030, 450, 1630, 790))
        channels = difference.split()
        maximum = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
        histogram = maximum.histogram()
        motion[f'{first} to {second}'] = {
            'background_mean_rgb_change': round(sum(ImageStat.Stat(difference).mean) / 3, 2),
            'background_pixels_changing_by_8_or_more_percent': round(sum(histogram[8:]) / sum(histogram) * 100, 2),
        }
    (folder / 'motion-comparison.json').write_text(json.dumps(motion, indent=2))
    print(json.dumps(motion))
