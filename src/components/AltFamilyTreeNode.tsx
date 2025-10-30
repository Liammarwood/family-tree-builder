import React, { useMemo } from "react";
import { Handle, Position, NodeProps, useStore } from "reactflow";
import { Avatar, Box, Card, CardContent, Chip, Typography, Badge } from "@mui/material";
import { Male, Female, Public } from "@mui/icons-material";
import CountryFlag from "react-country-flag";
import { getCode } from "country-list";
import { Work, Cake, CalendarToday } from "@mui/icons-material";
import { NODE_WIDTH } from '@/libs/spacing';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { useConfiguration } from "@/hooks/useConfiguration";
import { getChildHandleGroups } from "@/libs/handleGroups";

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  if (!yyyy || !mm || !dd) return dateStr;
  return `${dd}/${mm}/${yyyy}`;
}

export const AltFamilyTreeNode = ({
  selected,
  data,
  preview,
  id,
}: NodeProps<FamilyNodeData> & { preview?: boolean }) => {
  const { showHandles, avatarVariant, nodeColor, textColor, fontFamily, nodeStyle } = useConfiguration();

  // Get all nodes and edges from React Flow store to compute child handle groups
  const nodes = useStore((state) => state.getNodes());
  const edges = useStore((state) => state.edges);

  // Compute child handle groups for this node
  const childHandleGroups = useMemo(() => {
    if (preview) return [];
    return getChildHandleGroups(id, nodes, edges);
  }, [id, nodes, edges, preview]);

  const isDeceased = !!data.dateOfDeath;
  const bigHandle = {
    width: 16,
    height: 16,
    background: '#555',
    borderRadius: '50%',
    border: '2px solid white',
  };

  return (
    <Box
      sx={{
        width: NODE_WIDTH,
        position: 'relative',
        paddingTop: '55px', // Space for the overlapping avatar
      }}
    >
      {/* Overlapping Avatar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            data.gender === 'Male' ? (
              <Male sx={{ color: '#2196f3', fontSize: 22, bgcolor: '#fff', borderRadius: '50%' }} />
            ) : data.gender === 'Female' ? (
              <Female sx={{ color: '#e91e63', fontSize: 22, bgcolor: '#fff', borderRadius: '50%' }} />
            ) : null
          }
        >
          <Avatar
            src={data.image}
            alt={data.name}
            variant={avatarVariant}
            sx={{
              width: 110,
              height: 110,
              border: '5px solid',
              borderColor: 'background.paper',
              boxShadow: selected
                ? '0 8px 24px rgba(255, 152, 0, 0.4)'
                : isDeceased
                  ? '0 6px 20px rgba(0,0,0,0.15)'
                  : '0 6px 20px rgba(33, 150, 243, 0.3)',
              filter: isDeceased ? 'grayscale(40%)' : 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
          />
        </Badge>
      </Box>

      {/* Card Content */}
      <Card
        sx={{
          borderRadius: 3,
          border: '2.5px solid',
          borderColor: selected ? '#ff9800' : (isDeceased ? 'grey.300' : (nodeColor || 'primary.light')),
          background: isDeceased
            ? 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
            : (nodeStyle === 'card' ? `linear-gradient(135deg, ${nodeColor} 0%, #f8f9fa 100%)` : nodeStyle === 'compact' ? nodeColor : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'),
          boxShadow: selected
            ? '0 0 0 6px #ffe0b2, 0 8px 24px #ff980033'
            : '0 8px 24px rgba(0,0,0,0.12)',
          transition: 'border 0.2s, box-shadow 0.2s, transform 0.2s',
          animation: selected ? 'pulse-border 1.1s cubic-bezier(.4,0,.2,1) infinite alternate' : 'none',
          '@keyframes pulse-border': {
            '0%': { boxShadow: '0 0 0 6px #ffe0b2, 0 8px 24px #ff980033' },
            '100%': { boxShadow: '0 0 0 14px #ffecb3, 0 8px 32px #ff980033' },
          },
        }}
      >
        <CardContent sx={{ pt: 7, px: 2.5, pb: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            {/* Name and Maiden Name */}
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDeceased ? 'text.secondary' : (textColor || 'primary.dark'),
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                  fontFamily: fontFamily,
                }}
              >
                {data.name}
              </Typography>
              {data.maidenName && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    fontSize: '0.8rem',
                    mt: 0.3
                  }}
                >
                  ({data.maidenName})
                </Typography>
              )}
            </Box>

            {/* Decorative Divider */}
            <Box
              sx={{
                width: 50,
                height: 3,
                background: isDeceased
                  ? 'linear-gradient(90deg, #bdbdbd, #e0e0e0, #bdbdbd)'
                  : 'linear-gradient(90deg, #2196f3, #64b5f6, #2196f3)',
                borderRadius: 2,
              }}
            />

            {/* Dates */}
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {data.dateOfBirth && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cake sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    <strong>Born:</strong> {formatDate(data.dateOfBirth)}
                  </Typography>
                </Box>
              )}
              {data.dateOfDeath && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: 'error.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    <strong>Died:</strong> {formatDate(data.dateOfDeath)}
                  </Typography>
                </Box>
              )}
              {/* Country of Birth */}
              {data.countryOfBirth && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    <strong>Country of Birth:</strong>
                  </Typography>
                  <CountryFlag
                    countryCode={getCode(data.countryOfBirth) || ''}
                    svg
                    style={{ width: 20, height: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                    title={data.countryOfBirth}
                  />
                </Box>
              )}
            </Box>

            {/* Occupation */}
            {data.occupation && (
              <Chip
                icon={<Work sx={{ fontSize: 16 }} />}
                label={data.occupation}
                size="small"
                sx={{
                  backgroundColor: isDeceased ? 'grey.200' : (nodeColor || 'primary.main'),
                  color: isDeceased ? 'text.secondary' : (textColor || 'white'),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 32,
                  px: 1,
                  width: '100%',
                  '& .MuiChip-icon': {
                    color: isDeceased ? 'text.secondary' : (textColor || 'white')
                  }
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="parent"
        style={{ ...bigHandle, visibility: showHandles && !preview ? "visible" : "hidden", left: '50%', zIndex: 11 }}
      />
      
      {/* Dynamic child handles - one per child group */}
      {childHandleGroups.length > 0 ? (
        <>
          {childHandleGroups.map((group, index) => {
            // Calculate position: distribute handles evenly across the bottom
            const totalGroups = childHandleGroups.length;
            const leftPercent = totalGroups === 1 
              ? 50 
              : ((index + 1) / (totalGroups + 1)) * 100;
            
            return (
              <Handle
                key={group.handleId}
                type="source"
                position={Position.Bottom}
                id={group.handleId}
                style={{ 
                  ...bigHandle, 
                  visibility: showHandles && !preview ? "visible" : "hidden", 
                  left: `${leftPercent}%` 
                }}
              />
            );
          })}
          {/* Legacy handle for backward compatibility with existing edges */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="child"
            style={{ ...bigHandle, visibility: "hidden", left: '50%' }}
          />
        </>
      ) : (
        <>
          {/* Default child handle if no children */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="child-0"
            style={{ ...bigHandle, visibility: showHandles && !preview ? "visible" : "hidden", left: '50%' }}
          />
          {/* Legacy handle for backward compatibility with existing edges */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="child"
            style={{ ...bigHandle, visibility: "hidden", left: '50%' }}
          />
        </>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ ...bigHandle, visibility: showHandles && !preview ? "visible" : "hidden", top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ ...bigHandle, visibility: showHandles && !preview ? "visible" : "hidden", top: "50%" }}
      />
    </Box>
  );
};