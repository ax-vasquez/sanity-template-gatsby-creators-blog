import React, { useEffect, useMemo, useState } from 'react'
import octokitClient from '../../../../github/client'
import { Endpoints } from '@octokit/types'
// import cs from 'clsx'
import styles from './Languages.module.scss'
import { GITHUB_LANGUAGE_COLORS } from './githubColors'
import { Pie, PieChart } from 'recharts'

interface LanguagesProps {
    githubOwner: string | undefined,
    githubRepo: string | undefined
}

export const Languages: React.FC<LanguagesProps> = ({
    githubOwner,
    githubRepo
}) => {

    const [languages, setLanguages] = useState(undefined as Endpoints[`GET /repos/{owner}/{repo}/languages`][`response`][`data`] | undefined)
    const [loadingLanguages, setLoadingLanguages] = useState(false)

    const requestArgs = useMemo(() => {
        return {
            owner: githubOwner || ``,
            repo: githubRepo || ``,
            headers: {
              'X-GitHub-Api-Version': `2022-11-28`
            }
          }
    }, [githubOwner, githubRepo])

    /**
     * maxBytes is determined by the getLanguagesResponse object. GitHub returns languages data as a key-value
     * object where the language name is the key and the BYTE amount is the value (not the line count). This
     * value is used when calculating the percentage of language usages.
     */
    const maxBytes = useMemo(() => {
        let bytes = 0
        if (languages) {
        Object.keys(languages).forEach((key) => {
            bytes += languages[key]
        })
        }
        return bytes
    }, [languages])

    const languageChartData = useMemo(() => {
      const chartData = [] as { language: string, bytes: number, fill: string }[]
      if (languages) {
        Object.keys(languages).forEach(lang => {
          chartData.push({ language: lang, bytes: languages[lang], fill: GITHUB_LANGUAGE_COLORS[lang].color || `red` })
        })
      }
      return chartData
    }, [languages])

    useEffect(() => {

        const getLanguages = async () => {
          if (!languages) {
            setLoadingLanguages(true)
            let languagesResponse = await octokitClient.request(`GET /repos/{owner}/{repo}/languages`, requestArgs)
            if (Object.keys(languagesResponse.data).length > 0) {
              setLanguages(languagesResponse.data)
            }
            setLoadingLanguages(false)
          }
        }

        getLanguages()

    }, [requestArgs])

    if (loadingLanguages) {
        return (
          <span className={styles.noticeText}>Loading...</span>
        )
    }

    return (
      <>
        {languages ?
          <>
            {/* <span className={styles.languagesBar}>{Object.keys(languages).map(key => {
                        const currentBytes: number = languages[key]
                        const percentage = (currentBytes / maxBytes) * 100
                        return <span
                            key={`lang-span-${key.toLowerCase()}`}
                            className={cs(styles.languageSpan)}
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: GITHUB_LANGUAGE_COLORS[key].color || `red`
                            }}/>
                    })}</span> */}
            <PieChart width={300} height={300}>
              <Pie
                data={languageChartData}
                nameKey="language"
                dataKey="bytes"
                innerRadius={60}
                strokeWidth={5}
              />
            </PieChart>
            <ul className={styles.languagesList}>
              {Object.keys(languages).map(key => {
                            const currentBytes: number = languages[key]
                            const percentage = (currentBytes / maxBytes) * 100
                            return <li
                                    className={styles.languageListItem}
                                    key={`lang-list-item-${key.toLowerCase()}-usages`}
                                    style={{
                                        color: GITHUB_LANGUAGE_COLORS[key].color || `red`
                                    }}
                                    onClick={() => window.open(GITHUB_LANGUAGE_COLORS[key].url, `_blank`)}
                                >
                              <div className={styles.languageLabel}>
                                <span className={styles.languageKey}>{key}</span>
                                <span className={styles.languagePercentage}>{percentage.toFixed(2)}%</span>
                              </div>
                            </li>
                        })}
            </ul>
          </>
        :
          <>
            <span className={styles.noticeText}>No data</span>
          </>
        }
      </>
    )
}
