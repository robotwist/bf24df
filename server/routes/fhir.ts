import { Router, Request, Response } from 'express';
import { validateFHIRResource } from '../utils/fhir';
import { FHIRResource } from '../models/FHIRResource';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /fhir/{resourceType}/{id}:
 *   get:
 *     summary: Get a FHIR resource by ID
 *     tags: [FHIR]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of FHIR resource
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource
 *     responses:
 *       200:
 *         description: The FHIR resource
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
router.get('/:resourceType/:id', async (req: Request, res: Response) => {
  try {
    const { resourceType, id } = req.params;
    const resource = await FHIRResource.findOne({ resourceType, id });
    
    if (!resource) {
      return res.status(404).json({ error: `${resourceType} with id ${id} not found` });
    }
    
    res.json(resource);
  } catch (error) {
    logger.error('Error retrieving FHIR resource:', error);
    res.status(500).json({ error: 'Failed to retrieve FHIR resource' });
  }
});

/**
 * @swagger
 * /fhir/{resourceType}:
 *   post:
 *     summary: Create a new FHIR resource
 *     tags: [FHIR]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of FHIR resource
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceType
 *             properties:
 *               resourceType:
 *                 type: string
 *               id:
 *                 type: string
 *               meta:
 *                 type: object
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Invalid resource
 *       500:
 *         description: Server error
 */
router.post('/:resourceType', async (req: Request, res: Response) => {
  try {
    const { resourceType } = req.params;
    const resource = req.body;
    
    if (!validateFHIRResource(resource)) {
      return res.status(400).json({ error: 'Invalid FHIR resource' });
    }
    
    const newResource = new FHIRResource({
      resourceType,
      id: resource.id || `temp-${Date.now()}`,
      meta: resource.meta,
      data: resource,
    });
    
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    logger.error('Error creating FHIR resource:', error);
    res.status(500).json({ error: 'Failed to create FHIR resource' });
  }
});

/**
 * @swagger
 * /fhir/{resourceType}/{id}:
 *   put:
 *     summary: Update a FHIR resource
 *     tags: [FHIR]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of FHIR resource
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceType
 *             properties:
 *               resourceType:
 *                 type: string
 *               meta:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
router.put('/:resourceType/:id', async (req: Request, res: Response) => {
  try {
    const { resourceType, id } = req.params;
    const resource = req.body;
    
    if (!validateFHIRResource(resource)) {
      return res.status(400).json({ error: 'Invalid FHIR resource' });
    }
    
    const updatedResource = await FHIRResource.findOneAndUpdate(
      { resourceType, id },
      {
        meta: resource.meta,
        data: resource,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedResource) {
      return res.status(404).json({ error: `${resourceType} with id ${id} not found` });
    }
    
    res.json(updatedResource);
  } catch (error) {
    logger.error('Error updating FHIR resource:', error);
    res.status(500).json({ error: 'Failed to update FHIR resource' });
  }
});

/**
 * @swagger
 * /fhir/{resourceType}/{id}:
 *   delete:
 *     summary: Delete a FHIR resource
 *     tags: [FHIR]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of FHIR resource
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resource
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
router.delete('/:resourceType/:id', async (req: Request, res: Response) => {
  try {
    const { resourceType, id } = req.params;
    const deletedResource = await FHIRResource.findOneAndDelete({ resourceType, id });
    
    if (!deletedResource) {
      return res.status(404).json({ error: `${resourceType} with id ${id} not found` });
    }
    
    res.json({ message: `Deleted ${resourceType} with id ${id}` });
  } catch (error) {
    logger.error('Error deleting FHIR resource:', error);
    res.status(500).json({ error: 'Failed to delete FHIR resource' });
  }
});

/**
 * @swagger
 * /fhir/{resourceType}:
 *   get:
 *     summary: Search FHIR resources
 *     tags: [FHIR]
 *     parameters:
 *       - in: path
 *         name: resourceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of FHIR resource
 *       - in: query
 *         name: identifier
 *         schema:
 *           type: string
 *         description: Search by identifier
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: birthdate
 *         schema:
 *           type: string
 *         description: Search by birthdate
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resourceType:
 *                   type: string
 *                 type:
 *                   type: string
 *                 total:
 *                   type: number
 *                 entry:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get('/:resourceType', async (req: Request, res: Response) => {
  try {
    const { resourceType } = req.params;
    const query = req.query;
    
    // Build search criteria
    const searchCriteria: any = { resourceType };
    
    // Add search parameters based on query
    if (query.identifier) {
      searchCriteria['data.identifier.value'] = query.identifier;
    }
    if (query.name) {
      searchCriteria['data.name.family'] = { $regex: query.name, $options: 'i' };
    }
    if (query.birthdate) {
      searchCriteria['data.birthDate'] = query.birthdate;
    }
    
    const resources = await FHIRResource.find(searchCriteria)
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      resourceType: 'Bundle',
      type: 'searchset',
      total: resources.length,
      entry: resources.map(resource => ({
        resource: resource.data,
      })),
    });
  } catch (error) {
    logger.error('Error searching FHIR resources:', error);
    res.status(500).json({ error: 'Failed to search FHIR resources' });
  }
});

export default router; 