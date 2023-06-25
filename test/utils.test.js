import { test } from 'vitest'
import { copyFromXml, getImageUrl, parseXml } from '../lib/utils'

test('copyFromXml', async ({ expect }) => {
	const xml = await parseXml(`
        <author>
            <name>Asim</name>
            <uri>http://www.blogger.com/profile/15225094984685742326</uri>
            <email>noreply@blogger.com</email>
            <gd:image rel="http://schemas.google.com/g/2005#thumbnail" width="16" height="16" src="https://img1.blogblog.com/img/b16-rounded.gif" />
        </author>
    `)
	const obj = copyFromXml(xml.author, ['name', 'uri', 'email', ['gd:image', 'image']])
	expect(obj.name).toBe('Asim')
})

test('getImageUrl', async ({ expect }) => {
	const xmlContent = await parseXml(`
        <item>
            <content:encoded><![CDATA[<figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/1*s8Gqm3dmzDaYJXkotarQQg.jpeg" /></figure>]]></content:encoded>
        </item>
    `)
	const img = getImageUrl(xmlContent.item)
	expect(img).toBe('https://cdn-images-1.medium.com/max/1024/1*s8Gqm3dmzDaYJXkotarQQg.jpeg')
})
