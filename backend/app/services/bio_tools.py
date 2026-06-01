from __future__ import annotations

import asyncio
import math
import re
import shutil
from dataclasses import dataclass


RCSB_DOWNLOAD_BASE = "https://files.rcsb.org/download"
ALPHAFOLD_FILE_BASE = "https://alphafold.ebi.ac.uk/files"
ALPHAFOLD_API_BASE = "https://alphafold.ebi.ac.uk/api/prediction"
REACTOME_CONTENT_BASE = "https://reactome.org/ContentService"


PROTEINS = {
    "crispr-cas9": {
        "label": "CRISPR-Cas9",
        "accession": "Q99ZW2",
        "pdb_id": "4OO8",
        "organism": "Streptococcus pyogenes",
        "teaching_focus": "RuvC 与 HNH 双核酸酶结构域、sgRNA 识别、DNA 切割机制",
        "confidence": 91.8,
    },
    "cas9": {
        "label": "CRISPR-Cas9",
        "accession": "Q99ZW2",
        "pdb_id": "4OO8",
        "organism": "Streptococcus pyogenes",
        "teaching_focus": "RuvC 与 HNH 双核酸酶结构域、sgRNA 识别、DNA 切割机制",
        "confidence": 91.8,
    },
    "gfp": {
        "label": "绿色荧光蛋白 GFP",
        "accession": "P42212",
        "pdb_id": "1GFL",
        "organism": "Aequorea victoria",
        "teaching_focus": "β 桶结构、发色团形成、荧光报告基因应用",
        "confidence": 94.2,
    },
    "egfp": {
        "label": "绿色荧光蛋白 GFP",
        "accession": "P42212",
        "pdb_id": "1GFL",
        "organism": "Aequorea victoria",
        "teaching_focus": "β 桶结构、发色团形成、荧光报告基因应用",
        "confidence": 94.2,
    },
    "胰岛素": {
        "label": "胰岛素",
        "accession": "P01308",
        "pdb_id": "4INS",
        "organism": "Homo sapiens",
        "teaching_focus": "A/B 链、二硫键、激素受体识别",
        "confidence": 93.1,
    },
    "血红蛋白": {
        "label": "血红蛋白",
        "accession": "P69905",
        "pdb_id": "4HHB",
        "organism": "Homo sapiens",
        "teaching_focus": "四聚体装配、血红素结合、变构调控与氧运输",
        "confidence": 96.5,
    },
    "4hhb": {
        "label": "血红蛋白",
        "accession": "P69905",
        "pdb_id": "4HHB",
        "organism": "Homo sapiens",
        "teaching_focus": "四聚体装配、血红素结合、变构调控与氧运输",
        "confidence": 96.5,
    },
}


PATHWAYS = {
    "cell-cycle": {
        "name": "细胞周期",
        "reactome_id": "R-HSA-1640170",
        "focus": "Cyclin/CDK、Rb/E2F、p53/p21 检查点",
        "nodes": [
            {"id": "dna-damage", "label": "DNA 损伤", "type": "signal"},
            {"id": "p53", "label": "p53", "type": "protein"},
            {"id": "p21", "label": "p21", "type": "inhibitor"},
            {"id": "cdk46", "label": "CDK4/6", "type": "protein"},
            {"id": "rb", "label": "Rb", "type": "protein"},
            {"id": "e2f", "label": "E2F", "type": "tf"},
            {"id": "s-phase", "label": "S 期进入", "type": "process"},
        ],
        "edges": [
            {"from": "dna-damage", "to": "p53", "type": "activation"},
            {"from": "p53", "to": "p21", "type": "activation"},
            {"from": "p21", "to": "cdk46", "type": "inhibition"},
            {"from": "cdk46", "to": "rb", "type": "phosphorylation"},
            {"from": "rb", "to": "e2f", "type": "inhibition"},
            {"from": "e2f", "to": "s-phase", "type": "activation"},
        ],
    },
    "apoptosis": {
        "name": "细胞凋亡",
        "reactome_id": "R-HSA-109581",
        "focus": "Bax/Bcl-2、线粒体 Cyt c、Caspase 级联",
        "nodes": [
            {"id": "death-signal", "label": "死亡信号", "type": "signal"},
            {"id": "bax", "label": "Bax", "type": "protein"},
            {"id": "bcl2", "label": "Bcl-2", "type": "inhibitor"},
            {"id": "cytc", "label": "Cyt c", "type": "protein"},
            {"id": "casp3", "label": "Caspase-3", "type": "enzyme"},
            {"id": "apoptosis", "label": "凋亡执行", "type": "process"},
        ],
        "edges": [
            {"from": "death-signal", "to": "bax", "type": "activation"},
            {"from": "bcl2", "to": "bax", "type": "inhibition"},
            {"from": "bax", "to": "cytc", "type": "activation"},
            {"from": "cytc", "to": "casp3", "type": "activation"},
            {"from": "casp3", "to": "apoptosis", "type": "activation"},
        ],
    },
    "mapk": {
        "name": "MAPK 信号通路",
        "reactome_id": "R-HSA-5673001",
        "focus": "RTK-Ras-Raf-MEK-ERK 磷酸化级联",
        "nodes": [
            {"id": "gf", "label": "生长因子", "type": "signal"},
            {"id": "rtk", "label": "RTK", "type": "receptor"},
            {"id": "ras", "label": "Ras", "type": "protein"},
            {"id": "raf", "label": "Raf", "type": "enzyme"},
            {"id": "mek", "label": "MEK", "type": "enzyme"},
            {"id": "erk", "label": "ERK", "type": "enzyme"},
            {"id": "proliferation", "label": "细胞增殖", "type": "process"},
        ],
        "edges": [
            {"from": "gf", "to": "rtk", "type": "activation"},
            {"from": "rtk", "to": "ras", "type": "activation"},
            {"from": "ras", "to": "raf", "type": "activation"},
            {"from": "raf", "to": "mek", "type": "phosphorylation"},
            {"from": "mek", "to": "erk", "type": "phosphorylation"},
            {"from": "erk", "to": "proliferation", "type": "activation"},
        ],
    },
}


CODONS = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L", "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*", "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L", "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q", "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M", "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K", "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V", "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E", "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}


def resolve_protein_structure(query: str) -> dict:
    raw = (query or "").strip()
    key = raw.lower()
    record = PROTEINS.get(key)

    if record is None and re.fullmatch(r"[0-9][A-Za-z0-9]{3}", raw):
        pdb_id = raw.upper()
        record = {
            "label": f"PDB {pdb_id}",
            "accession": "",
            "pdb_id": pdb_id,
            "organism": "RCSB PDB",
            "teaching_focus": "实验解析结构，适合观察链、配体和结构域。",
            "confidence": None,
        }
    elif record is None and re.fullmatch(r"[A-Za-z0-9]{5,10}", raw):
        accession = raw.upper()
        return {
            "label": f"UniProt {accession}",
            "accession": accession,
            "pdb_id": "",
            "organism": "AlphaFold DB",
            "source": "AlphaFold DB",
            "confidence": None,
            "teaching_focus": "预测结构，适合讲解 pLDDT 置信度和预测/实验结构差异。",
            "structure_url": f"{ALPHAFOLD_FILE_BASE}/AF-{accession}-F1-model_v4.pdb",
            "alphafold_url": f"{ALPHAFOLD_FILE_BASE}/AF-{accession}-F1-model_v4.pdb",
            "alphafold_api_url": f"{ALPHAFOLD_API_BASE}/{accession}",
        }
    elif record is None:
        # Try UniProt search for unknown proteins
        uniprot_result = _search_uniprot(raw)
        if uniprot_result:
            return uniprot_result
        record = PROTEINS["gfp"]

    pdb_id = record["pdb_id"].upper()
    accession = record["accession"].upper()
    return {
        **record,
        "pdb_id": pdb_id,
        "accession": accession,
        "source": "AlphaFold DB + RCSB PDB",
        "structure_url": f"{RCSB_DOWNLOAD_BASE}/{pdb_id}.pdb",
        "alphafold_url": f"{ALPHAFOLD_FILE_BASE}/AF-{accession}-F1-model_v4.pdb" if accession else "",
        "alphafold_api_url": f"{ALPHAFOLD_API_BASE}/{accession}" if accession else "",
    }


def _search_uniprot(query: str) -> dict | None:
    """Search UniProt for a protein by keyword. Returns structure info or None."""
    import httpx
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(
                "https://rest.uniprot.org/uniprotkb/search",
                params={
                    "query": f"{query} AND (reviewed:true)",
                    "fields": "accession,protein_name,organism_name,xref_pdb",
                    "format": "json",
                    "size": 1,
                },
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            results = data.get("results", [])
            if not results:
                return None

            entry = results[0]
            accession = entry.get("primaryAccession", "")
            protein_name = ""
            if entry.get("proteinDescription", {}).get("recommendedName"):
                protein_name = entry["proteinDescription"]["recommendedName"]["fullName"]["value"]
            organism = ""
            if entry.get("organism", {}).get("scientificName"):
                organism = entry["organism"]["scientificName"]

            # Check for PDB cross-references
            pdb_id = ""
            xrefs = entry.get("uniProtKBCrossReferences", [])
            for xref in xrefs:
                if xref.get("database") == "PDB":
                    pdb_id = xref.get("id", "").upper()
                    break

            label = protein_name or f"UniProt {accession}"
            structure_url = f"{RCSB_DOWNLOAD_BASE}/{pdb_id}.pdb" if pdb_id else ""
            alphafold_url = f"{ALPHAFOLD_FILE_BASE}/AF-{accession}-F1-model_v4.pdb" if accession else ""

            return {
                "label": label,
                "accession": accession,
                "pdb_id": pdb_id,
                "organism": organism,
                "source": "UniProt + AlphaFold DB",
                "teaching_focus": f"{protein_name}的结构与功能",
                "confidence": None,
                "structure_url": structure_url or alphafold_url,
                "alphafold_url": alphafold_url,
                "alphafold_api_url": f"{ALPHAFOLD_API_BASE}/{accession}" if accession else "",
            }
    except Exception:
        return None


def sanitize_sequence(sequence: str) -> str:
    body = "".join(line for line in (sequence or "").splitlines() if not line.strip().startswith(">"))
    return re.sub(r"[^A-Za-z]", "", body).upper().replace("U", "T")


def reverse_complement(sequence: str) -> str:
    return sanitize_sequence(sequence).translate(str.maketrans("ATGCN", "TACGN"))[::-1]


def gc_percent(sequence: str) -> float:
    seq = sanitize_sequence(sequence)
    valid = [base for base in seq if base in "ATGC"]
    if not valid:
        return 0.0
    return round(((valid.count("G") + valid.count("C")) / len(valid)) * 100, 2)


def translate_dna(sequence: str) -> str:
    seq = sanitize_sequence(sequence)
    return "".join(CODONS.get(seq[i : i + 3], "X") for i in range(0, len(seq) - 2, 3))


def estimate_tm(sequence: str) -> float:
    seq = sanitize_sequence(sequence)
    if not seq:
        return 0.0
    if len(seq) < 14:
        return float(2 * (seq.count("A") + seq.count("T")) + 4 * (seq.count("G") + seq.count("C")))
    return round(64.9 + 41 * ((seq.count("G") + seq.count("C")) - 16.4) / len(seq), 1)


def design_primers(sequence: str, primer_length: int = 20) -> dict:
    seq = sanitize_sequence(sequence)

    # Try primer3-py for professional primer design
    try:
        import primer3
        # Adjust parameters for short sequences
        min_primer = max(15, min(18, len(seq) // 4))
        max_primer = min(25, len(seq) // 3)
        opt_primer = min(primer_length, max_primer)
        min_product = max(50, len(seq) // 2)
        max_product = len(seq)

        result = primer3.design_primers(
            seq_args={
                "SEQUENCE_ID": "query",
                "SEQUENCE_TEMPLATE": seq,
            },
            global_args={
                "PRIMER_OPT_SIZE": opt_primer,
                "PRIMER_MIN_SIZE": min_primer,
                "PRIMER_MAX_SIZE": max_primer,
                "PRIMER_MIN_TM": 50.0,
                "PRIMER_MAX_TM": 70.0,
                "PRIMER_OPT_TM": 58.0,
                "PRIMER_MIN_GC": 20.0,
                "PRIMER_MAX_GC": 80.0,
                "PRIMER_PRODUCT_SIZE_RANGE": [[min_product, max_product]],
                "PRIMER_NUM_RETURN": 3,
            },
        )
        primers = []
        num_returned = result.get("PRIMER_PAIR_NUM_RETURNED", 0)
        for i in range(num_returned):
            fwd = {
                "sequence": result.get(f"PRIMER_LEFT_{i}_SEQUENCE", ""),
                "length": result.get(f"PRIMER_LEFT_{i}", [0, 0])[1],
                "tm": round(result.get(f"PRIMER_LEFT_{i}_TM", 0.0), 1),
                "gc_percent": round(result.get(f"PRIMER_LEFT_{i}_GC_PERCENT", 0.0), 1),
            }
            rev = {
                "sequence": result.get(f"PRIMER_RIGHT_{i}_SEQUENCE", ""),
                "length": result.get(f"PRIMER_RIGHT_{i}", [0, 0])[1],
                "tm": round(result.get(f"PRIMER_RIGHT_{i}_TM", 0.0), 1),
                "gc_percent": round(result.get(f"PRIMER_RIGHT_{i}_GC_PERCENT", 0.0), 1),
            }
            primers.append({
                "forward": fwd,
                "reverse": rev,
                "product_length": result.get(f"PRIMER_PAIR_{i}_PRODUCT_SIZE", 0),
                "tm_delta": round(abs(fwd["tm"] - rev["tm"]), 1),
                "penalty": round(result.get(f"PRIMER_PAIR_{i}_PENALTY", 0.0), 3),
            })
        if primers:
            return {
                "engine": "primer3-py",
                "primers": primers,
                **primers[0],
            }
    except ImportError:
        pass
    except Exception:
        pass

    # Built-in fallback
    if len(seq) < primer_length * 2:
        primer_length = max(12, min(20, len(seq) // 2))
    forward = seq[:primer_length]
    reverse = reverse_complement(seq[-primer_length:])

    def describe(primer: str) -> dict:
        return {
            "sequence": primer,
            "length": len(primer),
            "tm": estimate_tm(primer),
            "gc_percent": gc_percent(primer),
        }

    return {
        "forward": describe(forward),
        "reverse": describe(reverse),
        "product_length": len(seq),
        "tm_delta": round(abs(estimate_tm(forward) - estimate_tm(reverse)), 1),
        "engine": "built-in fallback (install primer3-py for professional design)",
    }


def restriction_sites(sequence: str) -> dict[str, list[int]]:
    seq = sanitize_sequence(sequence)
    enzymes = {
        "EcoRI": "GAATTC",
        "BamHI": "GGATCC",
        "HindIII": "AAGCTT",
        "XhoI": "CTCGAG",
        "NdeI": "CATATG",
    }
    results = {}
    for name, motif in enzymes.items():
        sites = []
        start = seq.find(motif)
        while start != -1:
            sites.append(start + 1)
            start = seq.find(motif, start + 1)
        results[name] = sites
    return results


def blast_search_online(sequence: str, timeout: int = 60) -> list[dict]:
    """Run BLAST search using NCBI online API via biopython.

    Returns real alignment results or empty list on failure.
    This function is synchronous and may block for up to `timeout` seconds.
    """
    try:
        from Bio.Blast import NCBIWWW, NCBIXML

        # Limit sequence length for reasonable query times
        query_seq = sequence[:5000]

        result_handle = NCBIWWW.qblast(
            program="blastn",
            database="nt",
            sequence=query_seq,
            hitlist_size=5,
            expect=0.001,
        )

        results = []
        for record in NCBIXML.parse(result_handle):
            for alignment in record.alignments[:5]:
                for hsp in alignment.hsps[:1]:
                    identity_pct = (hsp.identities / hsp.align_length) * 100
                    results.append({
                        "gene": alignment.hit_def.split(" ")[0] if alignment.hit_def else "unknown",
                        "organism": alignment.hit_def,
                        "identity": f"{identity_pct:.1f}%",
                        "e_value": f"{hsp.expect:.2e}",
                        "bitscore": round(hsp.bits, 1),
                        "align_length": hsp.align_length,
                        "engine": "NCBI BLAST (online)",
                    })
        result_handle.close()

        return results or [{
            "gene": "no significant hits",
            "organism": "-",
            "identity": "-",
            "e_value": "-",
            "engine": "NCBI BLAST (online)",
        }]
    except ImportError:
        return [{
            "error": "biopython not installed, install with: pip install biopython",
            "engine": "unavailable",
        }]
    except Exception as e:
        return [{
            "error": f"BLAST search failed: {str(e)[:120]}",
            "engine": "NCBI BLAST (online, error)",
        }]


async def blast_search_async(sequence: str, timeout: int = 60) -> list[dict]:
    """Async wrapper for BLAST search — runs in thread pool to avoid blocking."""
    return await asyncio.to_thread(blast_search_online, sequence, timeout)


def analyze_sequence(sequence: str, include_blast: bool = False) -> dict:
    seq = sanitize_sequence(sequence)
    invalid_count = len([base for base in seq if base not in "ATGC"])
    valid = "".join(base for base in seq if base in "ATGC")
    result = {
        "sequence": valid,
        "length": len(valid),
        "invalid_count": invalid_count,
        "base_counts": {base: valid.count(base) for base in "ATGC"},
        "gc_percent": gc_percent(valid),
        "translation": translate_dna(valid),
        "primers": design_primers(valid),
        "restriction_sites": restriction_sites(valid),
        "blast": [],
    }
    # BLAST is optional — use async endpoint for real BLAST results
    if include_blast and len(valid) >= 20:
        result["blast"] = blast_search_online(valid)
    return result


def parse_plasmid_features(content: str, sequence_length: int | None = None) -> list[dict]:
    features = []
    current: dict | None = None

    def flush() -> None:
        if not current or current.get("key") == "source":
            return
        if not current.get("start") or not current.get("end"):
            return
        label = current.get("label") or current.get("gene") or current.get("product") or current["key"]
        features.append(
            {
                "label": label,
                "type": current["key"],
                "start": current["start"],
                "end": current["end"],
                "direction": current["direction"],
                "source": "GenBank FEATURES parser",
            }
        )

    for line in (content or "").splitlines():
        match = re.match(r"\s{5}([A-Za-z_][\w-]*)\s+(.+)", line)
        if match:
            flush()
            key, location = match.groups()
            range_match = re.search(r"(\d+)\.\.(\d+)", location)
            current = {
                "key": key,
                "start": int(range_match.group(1)) if range_match else 0,
                "end": int(range_match.group(2)) if range_match else 0,
                "direction": "reverse" if "complement" in location else "forward",
            }
            continue

        qualifier = re.match(r'\s+/(label|gene|product|note)="?([^"]+)"?', line)
        if qualifier and current is not None:
            current[qualifier.group(1)] = qualifier.group(2).strip()

    flush()
    if features:
        return features

    seq_len = sequence_length or len(sanitize_sequence(content))
    return [
        {
            "label": "uploaded sequence",
            "type": "source",
            "start": 1,
            "end": seq_len,
            "direction": "forward",
            "source": "FASTA/plain sequence fallback",
        }
    ]


def pathway_record(key: str) -> dict:
    record = PATHWAYS.get(key)
    if record is None:
        # Try Reactome search for unknown pathways
        reactome_result = _search_reactome(key)
        if reactome_result:
            return reactome_result
        record = PATHWAYS["cell-cycle"]
    return {
        **record,
        "reactome_url": f"{REACTOME_CONTENT_BASE}/data/query/{record['reactome_id']}",
        "reactome_search_url": f"{REACTOME_CONTENT_BASE}/search/query?query={record['name']}&species=Homo%20sapiens&pageSize=8",
    }


def _search_reactome(query: str) -> dict | None:
    """Search Reactome for a pathway by keyword. Returns pathway info or None."""
    import httpx
    import re as _re
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(
                f"{REACTOME_CONTENT_BASE}/search/query",
                params={
                    "query": query,
                    "species": "Homo sapiens",
                    "pageSize": 5,
                },
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            # Reactome search returns results in 'results' -> list of objects with 'entries'
            result_groups = data.get("results", [])
            for group in result_groups:
                entries = group.get("entries", []) if isinstance(group, dict) else []
                for entry in entries:
                    if entry.get("type") in ("Pathway", "TopLevelPathway"):
                        st_id = entry.get("stId", "")
                        raw_name = entry.get("name", "")
                        # Strip HTML highlighting tags
                        name = _re.sub(r"<[^>]+>", "", raw_name) if raw_name else query
                        summary = entry.get("summation", "")
                        summary = _re.sub(r"<[^>]+>", "", summary) if summary else ""
                        return {
                            "name": name,
                            "reactome_id": st_id,
                            "focus": summary[:200] or f"Reactome 通路: {name}",
                            "nodes": [],
                            "edges": [],
                            "reactome_url": f"{REACTOME_CONTENT_BASE}/content/detail/{st_id}",
                            "reactome_search_url": f"{REACTOME_CONTENT_BASE}/search/query?query={name}&species=Homo%20sapiens&pageSize=8",
                        }
    except Exception:
        return None


def external_tool_status() -> dict:
    has_primer3 = False
    try:
        import primer3
        has_primer3 = True
    except ImportError:
        pass
    has_biopython = False
    try:
        import Bio
        has_biopython = True
    except ImportError:
        pass
    return {
        "blast+": bool(shutil.which("blastn") or shutil.which("blastp")),
        "blast_online": has_biopython,
        "mafft": bool(shutil.which("mafft")),
        "pLannotate": bool(shutil.which("pLannotate") or shutil.which("plannotate")),
        "primer3_core": bool(shutil.which("primer3_core")),
        "primer3_py": has_primer3,
        "biopython": has_biopython,
        "fallbacks_enabled": True,
    }
