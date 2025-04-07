import { Card, CardContent } from "@mui/material";

interface InfoCardProps {
  children: React.ReactNode;
  sx?: SxProps;
}

export const InfoCard = ({ children, sx }: InfoCardProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        transition: "all 0.3s ease",
        ...sx,
      }}
    >
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection:'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start' 
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};
