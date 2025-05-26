import { Card, Flex, Grid, Text, Heading, Inline } from '@sanity/ui'
import CincopaLogo from './CincopaLogo'

export default function UploaderAccessDialog() {
  return (
    <>
      <div style={{padding: 2}}>
        <Card
          sizing="border"
          style={{
            aspectRatio: '16/9',
            width: '100%',
            boxShadow: 'var(--card-bg-color) 0 0 0 2px',
            background: '#fbfbfb'
          }}
          paddingX={[2, 3, 4, 4]}
          radius={1}
          tone="transparent"
        >
          <Flex paddingY={4} justify="flex-end">
            <CincopaLogo height={50} />
          </Flex>
          <Flex paddingY={5} justify="center">
            <Grid columns={1} gap={[2, 3, 4, 4]}>
              <Inline paddingY={1} align="center">
                <Heading size={[0, 1, 2, 2]} style={{color: '#0086cf'}}>
                  Upload Not Available
                </Heading>
              </Inline>
              <Inline paddingY={1} align="center">
                <Text size={2}>A required API token is missing. Please contact your administrator or add the Cincopa token to your environment configuration.</Text>
              </Inline>
            </Grid>
          </Flex>
        </Card>
      </div>
    </>
  )
}
