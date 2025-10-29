function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const [yyyy, mm, dd] = dateStr.split('-');
  if (!yyyy || !mm || !dd) return dateStr;
  return `${dd}/${mm}/${yyyy}`;
}
import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Avatar, Box, Card, CardContent, Chip, Typography, Badge } from "@mui/material";
import { Male, Female, Public } from "@mui/icons-material";
import CountryFlag from "react-country-flag";
import { getCode } from "country-list";
import { Work, Cake, CalendarToday } from "@mui/icons-material";
import { NODE_WIDTH } from '@/libs/spacing';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { useConfiguration } from "@/hooks/useConfiguration";

export const FamilyTreeNode = ({
  selected,
  data
}: NodeProps<FamilyNodeData>) => {
  const { showHandles, avatarVariant } = useConfiguration();

  const isDeceased = !!data.dateOfDeath;
  const bigHandle = {
    width: 16,
    height: 16,
    background: '#555',
    borderRadius: '50%',
    border: '2px solid white',
  }
  return (
    <Card
      sx={{
        width: NODE_WIDTH,
        borderRadius: 3,
        border: '2.5px solid',
        borderColor: selected ? '#ff9800' : (isDeceased ? 'grey.300' : 'primary.light'),
        background: isDeceased
          ? 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: selected
          ? '0 0 0 6px #ffe0b2, 0 2px 12px #ff980033'
          : 1,
        transition: 'border 0.2s, box-shadow 0.2s',
        animation: selected ? 'pulse-border 1.1s cubic-bezier(.4,0,.2,1) infinite alternate' : 'none',
        '@keyframes pulse-border': {
          '0%': { boxShadow: '0 0 0 6px #ffe0b2, 0 2px 12px #ff980033' },
          '100%': { boxShadow: '0 0 0 14px #ffecb3, 0 2px 24px #ff980033' },
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          {/* Avatar with gender icon */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              data.gender === 'Male' ? <Male sx={{ color: '#2196f3', fontSize: 22, bgcolor: '#fff', borderRadius: '50%' }} /> :
                data.gender === 'Female' ? <Female sx={{ color: '#e91e63', fontSize: 22, bgcolor: '#fff', borderRadius: '50%' }} /> : null
            }
          >
            <Avatar
              src={data.image}
              alt={data.name}
              variant={avatarVariant}
              sx={{
                width: 100,
                height: 100,
                border: '3px solid',
                borderColor: isDeceased ? 'grey.400' : 'primary.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                filter: isDeceased ? 'grayscale(40%)' : 'none',
              }}
            />
          </Badge>

          {/* Name and Maiden Name */}
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isDeceased ? 'text.secondary' : 'primary.dark',
                fontSize: '1rem',
                lineHeight: 1.2
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

          {/* Occupation */}
          {data.occupation && (
            <Chip
              icon={<Work sx={{ fontSize: 16 }} />}
              label={data.occupation}
              size="small"
              sx={{
                backgroundColor: isDeceased ? 'grey.200' : 'primary.50',
                color: isDeceased ? 'text.secondary' : 'primary.main',
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 28,
                '& .MuiChip-icon': {
                  color: isDeceased ? 'text.secondary' : 'primary.main'
                }
              }}
            />
          )}

          {/* Details: Born, Country, Died as rows */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
            {data.dateOfBirth && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cake sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', minWidth: 60 }}>
                <strong>Born:</strong> {formatDate(data.dateOfBirth)}
              </Typography>
            </Box>}
            {data.countryOfBirth && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  <strong>Country of Birth:</strong> <CountryFlag
                    countryCode={getCode(data.countryOfBirth) || ''}
                    svg
                    style={{ width: 18, boxShadow: '0 1px 2px #bbb' }}
                    title={data.countryOfBirth}
                  />
                </Typography>

              </Box>
            )}
            {data.dateOfDeath && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  <strong>Died:</strong> {formatDate(data.dateOfDeath)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
      <Handle type="target" position={Position.Top} id="parent" style={{ ...bigHandle, visibility: showHandles ? "visible" : "hidden", left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="child" style={{ ...bigHandle, visibility: showHandles ? "visible" : "hidden", left: '50%' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...bigHandle, visibility: showHandles ? "visible" : "hidden", top: "50%" }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...bigHandle, visibility: showHandles ? "visible" : "hidden", top: "50%" }} />
    </Card>
  );
};
