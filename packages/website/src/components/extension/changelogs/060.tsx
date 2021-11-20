/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { Attributes } from 'preact'
import { h, Fragment } from 'preact'

import useHeart from '../../../useHeart'
import { Routes } from '../../../constants'

export default function Changelog060 (_: Attributes) {
  const heart = useHeart()

  return (
    <Fragment>
      <h2 className='text-2xl font-bold mb-2'>PronounDB got a new look!</h2>
      <p className='mb-2'>
        Massive changes right there! The website has been completely redesigned, as well as the extension, which were
        both rather poorly designed. Which makes sense, the first version of PronounDB was developed in less than a
        week!
      </p>
      <p className='mb-6'>
        The overall design remains quite simple, yet feels of better quality. And that was one of the goals of the
        redesign.
      </p>

      <h3 className='text-xl font-bold mb-2'>New website</h3>
      <p className='mb-2'>
        The homepage is now more colorful, and showcases the platforms PronounDB supports. Only a single preview has
        been put together at this time, but the end goal is to have previews for every supported platform on the
        website.
      </p>
      <p className='mb-6'>
        The website is now more accessible to people with disabilities, with better contrasts, better spacings,
        less density of information (especially in the "My Account" section), and better design consistency. Brand
        colors are less prominent, being less aggressive to people with certain disabilities.
      </p>

      <h3 className='text-xl font-bold mb-2'>Redesigned extension</h3>
      <p className='mb-2'>
        The extension is now more than just a few checkboxes quickly thrown together. The extension now has a proper
        interface, which looks quite beefy for what it does. Not all new features have been implemented, which is
        why it looks quite empty right now.
      </p>
      <p className='mb-2'>
        The extension will have far more configuration in the future (more on that later), and will soon show cool
        statistics, for people like me who like to see cool numbers.
      </p>
      <p className='mb-2'>
        In addition to the redesign, a lot of bug fixes and some new features have been added to the extension. Here's
        a quick summary of what changed:
      </p>
      <ul className='list-inside list-disc mb-6 pl-4'>
        <li className='mb-1'>
          <b>Performance</b> has been greatly improved on Chrome and Edge. The extension also received performance
          improvements on Firefox, but to a lesser extent.
        </li>
        <li className='mb-1'>
          <b>Twitch integration</b> has been improved, and pronouns now show in streamers "About" section, as well as
          in chat profile popouts.
        </li>
        <li className='mb-1'>
          <b>Twitter integration</b> is no longer borderline useless, showing pronouns in profiles and on tweets.
        </li>
        <li className='mb-1'>
          <b>Facebook integration</b> has been fixed. Pronouns now show consistently where they should.
        </li>
        <li className='mb-1'>
          <b>Discord integration</b> has been updated after internal Discord changes broke everything apart.
        </li>
      </ul>

      <h3 className='text-xl font-bold mb-2'>Coming soon: Better settings</h3>
      <p className='mb-2'>
        You will soon be able to customize the extension even more! The extension will soon let you disable pronouns
        in specific places rather than on the entire website, if you just dislike having them in that one spot. You'll
        also be able to pick for some cases different display styles.
      </p>
      <p className='mb-2'>
        There will also be a way to prevent the extension from opening the changelog when updating, if you hate it.
        I promise ;-;
      </p>
      <p className='mb-6'>
        This is planned to land in the next update, and to mark the version 1.0.0 release, along with the usual bug
        fixes. Hype!
      </p>

      <h3 className='text-xl font-bold mb-2'>Future plans</h3>
      <p className='mb-2'>
        There are a lot of things I want to add to PronounDB. One of the plans I want to implement in the (relatively)
        near future is internationalization, to make the extension accessible to more than just English-speaking
        audiences.
      </p>
      <p className='mb-6'>
        There is of course the goal to add more and more platforms to PronounDB to make it more and more useful, and
        there are already quite a few platforms with planned support. If you want to suggest one, head over to
        the <a href={Routes.GH_TRACKER} target='_blank' rel='noreferrer' className='link'>issue tracker on GitHub</a>!
      </p>

      <h3 className='text-xl font-bold mb-2'>Thank you {heart}</h3>
      <p className='mb-2'>
        Thank you for using the extension, and for the support. PronounDB already has almost 5,000 users in its first
        year of existence, and the numbers keep growing.
      </p>
      <p className='mb-2'>
        PronounDB will continue to grow and as I said there's a fair share of things slowly making its way into the
        extension. If you wish to support me and my work directly, you can help me pay for the hosting and keep
        PronounDB alive by <a href={Routes.DONATE} target='_blank' rel='noreferrer' className='link'>donating</a>.
      </p>
      <p className='mb-2'>
        If you don't want or can't donate, leaving a review on extension stores is also a great way of showing me you
        appreciate the extension. You can also spread the word around you, so more and more people use the extension
        and the better the extension will get for everyone.
      </p>
      <p>
        Thank you so much for your support 🥰
      </p>
    </Fragment>
  )
}
