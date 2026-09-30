import { OneBeautifulThing } from '@/types'

export const BEAUTIFUL_THINGS: OneBeautifulThing[] = [
  {
    id: 'bt-1',
    title: 'Rain against a window',
    description: 'The rhythmic, quiet patter of droplets racing down cold glass while you stay warm inside.'
  },
  {
    id: 'bt-2',
    title: 'Morning light in an empty room',
    description: 'Slanted amber sunlight illuminating dust motes drifting slowly through quiet air.'
  },
  {
    id: 'bt-3',
    title: 'A hot cup held with both hands',
    description: 'The simple warmth traveling through your fingers before you take the first slow sip.'
  },
  {
    id: 'bt-4',
    title: 'The crescent moon over city rooftops',
    description: 'A delicate sliver of silver hanging silently above the noisy traffic below.'
  },
  {
    id: 'bt-5',
    title: 'The smell after rain',
    description: 'Petrichor — the ancient, clean scent of dry soil and pavement welcoming sudden water.'
  },
  {
    id: 'bt-6',
    title: 'A dog sleeping in a sunbeam',
    description: 'Completely surrendered to rest, moving along the floor as the patch of warm sun shifts.'
  },
  {
    id: 'bt-7',
    title: 'Someone laughing with their whole face',
    description: 'Unrehearsed, unguarded delight that makes everyone around them slightly lighter.'
  },
  {
    id: 'bt-8',
    title: 'Wind moving through tall grass or trees',
    description: 'A collective green wave whispering without needing anyone to listen.'
  },
  {
    id: 'bt-9',
    title: 'An unexpected kind word',
    description: 'When someone notices an effort you thought was invisible and simply says thank you.'
  }
]

export function getTodayBeautifulThing(): OneBeautifulThing {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return BEAUTIFUL_THINGS[dayOfYear % BEAUTIFUL_THINGS.length]
}
