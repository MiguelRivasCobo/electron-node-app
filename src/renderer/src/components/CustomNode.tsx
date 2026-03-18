import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Box, Avatar, Typography, Paper } from '@mui/material'
import type { FlowNodeData } from '../types'

function CustomNode({ data, selected }: NodeProps<FlowNodeData>): JSX.Element {
  return (
    <>
      {/* Incoming connection handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#6366f1',
          border: '2px solid #0f172a',
          width: 10,
          height: 10
        }}
      />

      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          width: 160,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.06)',
          bgcolor: 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.light',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
          }
        }}
      >
        {/* Node image */}
        <Avatar
          src={data.imageUrl}
          alt={data.title}
          sx={{
            width: 56,
            height: 56,
            border: '2px solid',
            borderColor: selected ? 'primary.main' : 'rgba(99,102,241,0.5)'
          }}
        />

        {/* Node title */}
        <Typography
          variant="subtitle2"
          fontWeight={600}
          textAlign="center"
          color="text.primary"
          sx={{ lineHeight: 1.3, wordBreak: 'break-word' }}
        >
          {data.title}
        </Typography>

        {/* Subtle id badge */}
        <Box
          sx={{
            px: 1,
            py: 0.25,
            bgcolor: 'rgba(99,102,241,0.15)',
            borderRadius: 1
          }}
        >
          <Typography variant="caption" color="primary.main" fontFamily="monospace">
            {data.dbId}
          </Typography>
        </Box>
      </Paper>

      {/* Outgoing connection handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#6366f1',
          border: '2px solid #0f172a',
          width: 10,
          height: 10
        }}
      />
    </>
  )
}

export default memo(CustomNode)
