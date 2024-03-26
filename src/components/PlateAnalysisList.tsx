import { collection, deleteDoc, doc, getFirestore, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirebaseUser } from "../hooks";
import PlateAnalysisItem from "./PlateAnalysisItem";
import { AnalysisResult, PlateAnalysis } from "../types";
import { PlateAnalysisItemModal } from "./PlateAnalysisItemModal";
import Box from "@mui/material/Box";


const db = getFirestore();
export const PlateAnalysisList = () => {

  const user = useFirebaseUser();
  const [plateAnalysisList, setPlateAnalysisList] = useState<AnalysisResult[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<[PlateAnalysis, string] | null>(null);

  const showMore = (item: PlateAnalysis, imgSrc: string) => {
    setSelectedItem([item, imgSrc]);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const deleteItem = async (docId: string)=> {
    if (!user) {
      return;
    }
    
    await deleteDoc(doc(db,  `analysis/${user.uid}/items`, docId));
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    const q = query(
      collection(db, `analysis/${user.uid}/items`),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plateAnalysisList = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      } as AnalysisResult))

      setPlateAnalysisList(plateAnalysisList);
    });

    return () => unsubscribe();
  }, [user]);

  return <>
    <Box sx={{marginTop:1}}>
      {plateAnalysisList.map((plateAnalysis) => <PlateAnalysisItem
        key={plateAnalysis.docId}
        analysis={plateAnalysis}
        onClick={showMore}
        onDelete={deleteItem} />)}
    </Box>
    <PlateAnalysisItemModal
      open={modalOpen}
      item={selectedItem?.[0]}
      itemImgSrc={selectedItem?.[1]}
      onClose={handleClose} />
  </>


};
