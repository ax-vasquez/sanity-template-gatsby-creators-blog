import React from 'react'
import { graphql } from 'gatsby'
import { getImage, GatsbyImage } from 'gatsby-plugin-image'
import BlockContent from '@sanity/block-content-to-react'
import serializers from '../serializers'
import Layout from '../components/Layout'
import { SanityCreator, SanityEmployer } from '../../graphql-types'

export const query = graphql`
query{
    sanityCreator(name: {eq: "Armando Vasquez"}) {
        image {
          asset {
            gatsbyImageData
          }
        }
        name
        linkedInUrl
        githubUrl
        _rawBio
    }
    allSanityEmployer(filter: {employed: {eq: true}}) {
        edges {
          node {
            startDate(formatString: "YYYY-MM")
            endDate(formatString: "YYYY-MM")
            employed
            name
            jobTitle
            image {
              asset {
                gatsbyImageData
              }
            }
            _rawDescription
          }
        }
      }
}
`

type SanityEmployerNode = {
    node: SanityEmployer
}

const AboutPage = ({ data }: { data: {
    sanityCreator: SanityCreator,
    allSanityEmployer: {
        edges: SanityEmployerNode[]
    }
} }) => {
    const creatorImage = getImage(data.sanityCreator.image.asset.gatsbyImageData)
    const {
        name,
        linkedInUrl,
        githubUrl,
        _rawBio,
    } = data.sanityCreator
    const mainEmployer = data.allSanityEmployer.edges[0].node
    const mainEmployerImage = getImage(mainEmployer.image.asset.gatsbyImageData)
    const {
        startDate,
        endDate,
        employed,
        jobTitle,
        _rawDescription,
    } = mainEmployer
    return (
        <Layout>
            <div className="creator-details-banner">
                <div className="creator-badge">
                    <GatsbyImage image={creatorImage} alt="creator_image" className="creator-image" />
                </div>
                <div className="creator-details">
                    <div>
                        <h1 className="my-auto">{name}</h1>
                        <div className="employer-image">
                            <GatsbyImage image={mainEmployerImage} alt="employer_image" />
                        </div>
                        <div className="flex mb-8">
                            <h2 className="font-bold my-auto">{jobTitle}</h2>
                            <div className="employment-dates ml-4 italic text-gray-400">
                                <p>
                                    {startDate}
                                    {' '}
                                    -
                                    {' '}
                                    {employed ? 'Present' : endDate}
                                </p>
                            </div>
                        </div>
                        <div className="italic mb-4">
                            <BlockContent className="job-block-content" blocks={_rawDescription} serializers={serializers} />
                        </div>
                    </div>
                    <div className="creator-details-footer">
                        {linkedInUrl ? (
                            <div>
                                <a href={linkedInUrl} target="_blank" rel="noreferrer">
                                    <img src="/linkedin-logo.png" className="h-8" alt="linkedin-logo" />
                                </a>
                            </div>
                        )
                            : null}
                        {githubUrl ? (
                            <div>
                                <a href={githubUrl} target="_blank" rel="noreferrer">
                                    <img src="/octocat-logo.png" className="h-8" alt="gh-logo" />
                                </a>
                            </div>
                        )
                            : null}
                    </div>
                </div>
            </div>
            <div className="article-body px-8">
                <BlockContent className="bio-block-content" blocks={_rawBio} serializers={serializers} />
            </div>
        </Layout>
    )
}

export default AboutPage
