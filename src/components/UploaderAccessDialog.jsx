import { Button, Card, Flex, Grid, Heading, Inline } from '@sanity/ui'
import CincopaLogo from './CincopaLogo'

export default function UploaderAccessDialog({ setDialogState }) {

  const handleOpen = () => {
    setDialogState('secrets');
  }

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
                  Upload access requires a valid token. Please provide one to proceed.
                </Heading>
              </Inline>
              <Inline paddingY={1} align="center">
                <Button mode="ghost" text="Configure API Token" onClick={handleOpen}/>
              </Inline>
            </Grid>
          </Flex>
        </Card>
      </div>
    </>
  )
}
